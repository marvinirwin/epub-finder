import {Repository} from "typeorm";
import {User} from "../entities/User";
import passport, {Profile} from "passport";
import refresh from "passport-oauth2-refresh";
import GithubStrategy from "passport-github2";
import moment from "moment";
import TwitterStrategy from 'passport-twitter';
import GoogleStrategy from 'passport-google-oauth20';
import LocalStrategy from 'passport-local'
import {Profiles} from "../types/custom";


export interface AuthArgs<T> {
    req: Express.Request;
    user: User;
    accessToken?: string;
    refreshToken?: string;
    tokenSecret?: string;
    identified?: string;
    params?: { [key: string]: any }
    email?: string;
    password?: string;
    profile: T;
    done: (err: any, user: User | undefined) => void
}

export const usePassportStrategies = (repo: Repository<User>) => {
    passport.serializeUser((user: User, done) => {
        done(null, user.id);
    });
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await repo.findOne(id);
            done(null, user);
        } catch (e) {
            done(e, null);
        }
    });

    /**
     * Sign in using Email and Password.
     */
    /*

    */
    /**
     * OAuth Strategy Overview
     *
     * - User is already logged in.
     *   - Check if there is an existing account with a provider id.
     *     - If there is, return an error message. (Account merging not supported)
     *     - Else link new OAuth account with currently logged-in user.
     * - User is not logged in.
     *   - Check if it's a returning user.
     *     - If returning user, sign in and we are done.
     *     - Else check if there is an existing account with user's email.
     *       - If there is, return an error message.
     *       - Else create a new account.
     */

    const strategy = <T extends Profile>(
        constructArgs: (...args: any[]) => AuthArgs<T>,
        mutateUser: (a: AuthArgs<T>) => User,
        tokenKind: string
    ) =>
        async (
            args: AuthArgs<T>
        ) => {
            const { req, user, accessToken, refreshToken, identified, profile, done, } = args;
            const linkUser = async (userId: number) => {
                const alreadyAssociatedUser = await repo.findOne({[tokenKind]: profile.id});
                if (alreadyAssociatedUser) {
                    throw new Error(`There is already a user associated with this ${tokenKind} account`);
                }
                const userToLink = await repo.findOne(userId);
                if (!userToLink) {
                    throw new Error(`Could not find user with id ${userId}`);
                }
                mutateUser(args);
                await repo.save(userToLink);
                return userToLink;
            };
            const createUser = async () => {
                const newUser = new User();
                mutateUser(args);
                await repo.save(newUser);
                done(null, newUser)
            };
            try {
                // @ts-ignore
                const id: number = req.user.id;
                if (id) {
                    const existingUser = await repo.findOne({[tokenKind]: profile.id});
                    if (existingUser) {
                        throw new Error(`There is already a ${tokenKind} account that belongs to this user.  Sign in with that account or delete it to link it to this user`);
                    }
                    return linkUser(id);
                } else {
                    const existingUser = await repo.findOne({[tokenKind]: profile.id});
                    if (existingUser) {
                        return existingUser;
                    }
                    return createUser();
                }
            } catch (e) {
                done(e, undefined);
            }
        }


    passport.use(
        new GithubStrategy.Strategy(
            {
                clientID: process.env.GITHUB_ID,
                clientSecret: process.env.GITHUB_SECRET,
                callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
                passReqToCallback: true,
                scope: ["user:email"]
            },
            strategy<Profiles.GithubProfile>(
                (req, accessToken, refreshToken, profile, done) => ({
                    req,
                    accessToken,
                    refreshToken,
                    profile,
                    done,
                    user: req.user
                }),
                ({user, profile, accessToken, refreshToken}) => {
                    user.tokens.push(JSON.stringify({kind: "github", accessToken}));
                    user.profile_name = user.profile_name || profile.displayName;
                    user.profile_picture = user.profile_picture || profile.avatar_url;
                    user.profile_location = user.profile_location || profile.location;
                    user.profile_website = user.profile_website || profile.blog;
                    return user;
                },
                'github'
            )
        ),
    );
    passport.use(
        new TwitterStrategy.Strategy({
                consumerKey: process.env.TWITTER_API_KEY,
                consumerSecret: process.env.TWITTER_API_KEY_SECRET,
                callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
                passReqToCallback: true
            }, strategy<Profiles.TwitterProfile>(
            (req, accessToken, tokenSecret, profile, done) => ({
                req,
                accessToken,
                tokenSecret,
                profile,
                done,
                user: req.user
            }),
            ({user, profile, accessToken, tokenSecret}) => {
                user.tokens.push(JSON.stringify({kind: "twitter", accessToken, tokenSecret}));
                user.profile_name = user.profile_name || profile.displayName;
                user.profile_location = user.profile_location || profile.location;
                user.profile_picture = user.profile_picture || profile.profile_image_url_https;
                return user;
            },
            'twitter'
            )
        )
    );
    passport.use(
        new GoogleStrategy.Strategy({
                clientID: process.env.GOOGLE_ID,
                clientSecret: process.env.GOOGLE_SECRET,
                callbackURL: "/auth/google/callback",
                passReqToCallback: true
            },
            strategy<Profiles.GoogleProfile>(
                (req, accessToken, refreshToken, params, profile, done) =>
                    ({
                        req, accessToken, refreshToken, params, profile, done, user: req.user
                    }),
                ({user, profile, params, refreshToken, accessToken}) => {
                    user.tokens.push(JSON.stringify({
                        kind: "google",
                        accessToken,
                        accessTokenExpires: moment().add(params.expires_in, "seconds").format(),
                        refreshToken,
                    }));
                    user.profile_name = user.profile_name || profile.displayName;
                    user.profile_gender = user.profile_gender || profile.gender;
                    user.profile_picture = user.profile_picture || profile.picture;
                    return user;
                },
                'google'
            )
        )
    );
    passport.use(
        new LocalStrategy.Strategy({usernameField: "email"},
            async (email, password, done) => {
                try {
                    const user = await repo.findOne({email: email.toLowerCase()});
                    if (!user) {
                        // @ts-ignore
                        return done(null, false, {msg: `Email ${email} not found.`});
                    }
                    if (!user.password) {
                        // @ts-ignore
                        return done(null, false, {msg: "Your account was registered using a sign-in provider. To enable password login, sign in using a provider, and then set a password under your user profile."});
                    }
                    const passwordsMatch = await user.comparePassword(password);
                    if (passwordsMatch) {
                        done(null, user);
                    } else {
                        // @ts-ignore
                        done(null, false, {msg: "Invalid email or password."});
                    }
                } catch (e) {
                    done(e);
                }
            }
        )
    );


    /**
     * Sign in with Snapchat.
     */
    /*
    passport.use(new SnapchatStrategy({
      clientID: process.env.SNAPCHAT_ID,
      clientSecret: process.env.SNAPCHAT_SECRET,
      callbackURL: "/auth/snapchat/callback",
      profileFields: ["id", "displayName", "bitmoji"],
      scope: ["user.display_name", "user.bitmoji.avatar"],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        User.findOne({ snapchat: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            req.flash("errors", { msg: "There is already a Snapchat account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.snapchat = profile.id;
              user.tokens.push({ kind: "snapchat", accessToken });
              user.profile.name = user.profile.name || profile.displayName;
              user.profile.picture = user.profile.picture || profile.bitmoji.avatarUrl;
              user.save((err) => {
                req.flash("info", { msg: "Snapchat account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ snapchat: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            return done(null, existingUser);
          }
          const user = new User();
          // Similar to Twitter & Instagram APIs, assign a temporary e-mail address
          // to get on with the registration process. It can be changed later
          // to a valid e-mail address in Profile Management.
          user.email = `${profile.id}@snapchat.com`;
          user.snapchat = profile.id;
          user.tokens.push({ kind: "snapchat", accessToken });
          user.profile.name = profile.displayName;
          user.profile.picture = profile.bitmoji.avatarUrl;
          user.save((err) => {
            done(err, user);
          });
        });
      }
    }));

    */
    /**
     * Sign in with Facebook.
     */
    /*
    passport.use(new FacebookStrategy({
      clientID: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
      profileFields: ["name", "email", "link", "locale", "timezone", "gender"],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            req.flash("errors", { msg: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.facebook = profile.id;
              user.tokens.push({ kind: "facebook", accessToken });
              user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
              user.profile.gender = user.profile.gender || profile._json.gender;
              user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.save((err) => {
                req.flash("info", { msg: "Facebook account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ facebook: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            return done(null, existingUser);
          }
          User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
            if (err) { return done(err); }
            if (existingEmailUser) {
              req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
              done(err);
            } else {
              const user = new User();
              user.email = profile._json.email;
              user.facebook = profile.id;
              user.tokens.push({ kind: "facebook", accessToken });
              user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
              user.profile.gender = profile._json.gender;
              user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
              user.profile.location = (profile._json.location) ? profile._json.location.name : "";
              user.save((err) => {
                done(err, user);
              });
            }
          });
        });
      }
    }));

    */
    /**
     * Sign in with GitHub.
     */
    /*
        passport.use(new PassportGoogle.GitHubStrategy({
            clientID: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
            passReqToCallback: true,
            scope: ["user:email"]
        }, async (req, accessToken, refreshToken, profile, done) => {
            if (req.user) {
                const userForThisGithubId = await repo.findOne({github: profile.id});
                if (userForThisGithubId) {
                    req.flash("errors", {msg: "There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account."});
                    done(null);
                } else {
                    const newOrExistingUser = await repo.findOne(req.user.id);
                    if (newOrExistingUser) {
                        newOrExistingUser.github = profile.id;
                        newOrExistingUser.tokens.push(JSON.stringify({kind: "github", accessToken}));
                        newOrExistingUser.profile_name = newOrExistingUser.profile.name || profile.displayName;
                        newOrExistingUser.profile_picture = newOrExistingUser.profile.picture || profile._json.avatar_url;
                        newOrExistingUser.profile_location = newOrExistingUser.profile.location || profile._json.location;
                        newOrExistingUser.profile_website = newOrExistingUser.profile.website || profile._json.blog;
                        await repo.save(newOrExistingUser);
                        req.flash("info", {msg: "GitHub account has been linked."});
                        done(null, newOrExistingUser);
                    } else {
                        done(new Error(`Could not find existing user with id ${req.user.id}`));
                    }
                }
            } else {
                const userByGithub = await repo.findOne({github: profile.id});
                if (userByGithub) return done(userByGithub);
                const userByEmail = await repo.findOne({email: profile._json.email})
                if (userByEmail) {
                    let msg = "There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.";
                    req.flash("errors", {msg: msg});
                    done(new Error(msg));
                } else {
                    const user = new User();
                    user.email = _.get(_.orderBy(profile.emails, ["primary", "verified"], ["desc", "desc"]), [0, "value"], null);
                    user.github = profile.id;
                    user.tokens.push(JSON.stringify({kind: "github", accessToken}));
                    user.profile_name = profile.displayName;
                    user.profile_picture = profile._json.avatar_url;
                    user.profile_location = profile._json.location;
                    user.profile_website = profile._json.blog;
                    await repo.save(user);
                    done(null, user);
                }
            }
        }));
    */

    /**
     * Sign in with Twitter.
     */
    /*
    passport.use(new TwitterStrategy({
      consumerKey: process.env.TWITTER_KEY,
      consumerSecret: process.env.TWITTER_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
      passReqToCallback: true
    }, (req, accessToken, tokenSecret, profile, done) => {
      if (req.user) {
        User.findOne({ twitter: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            req.flash("errors", { msg: "There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.twitter = profile.id;
              user.tokens.push({ kind: "twitter", accessToken, tokenSecret });
              user.profile.name = user.profile.name || profile.displayName;
              user.profile.location = user.profile.location || profile._json.location;
              user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
              user.save((err) => {
                if (err) { return done(err); }
                req.flash("info", { msg: "Twitter account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ twitter: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            return done(null, existingUser);
          }
          const user = new User();
          // Twitter will not provide an email address.  Period.
          // But a person’s twitter username is guaranteed to be unique
          // so we can "fake" a twitter email address as follows:
          user.email = `${profile.username}@twitter.com`;
          user.twitter = profile.id;
          user.tokens.push({ kind: "twitter", accessToken, tokenSecret });
          user.profile.name = profile.displayName;
          user.profile.location = profile._json.location;
          user.profile.picture = profile._json.profile_image_url_https;
          user.save((err) => {
            done(err, user);
          });
        });
      }
    }));

    */
    /**
     * Sign in with Google.
     */
    /*
        const googleStrategyConfig = new GoogleStrategy({
            clientID: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
            callbackURL: "/auth/google/callback",
            passReqToCallback: true
        }, async (req, accessToken, refreshToken, params, profile, done) => {
            if (req.user) {
                const userByGoogleId = await repo.findOne({google: profile.id})
                if (userByGoogleId && (userByGoogleId.id !== req.user.id)) {
                    let msg1 = "There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.";
                    req.flash("errors", {msg: msg1});
                    done(msg1);
                } else {
                    const userById = await repo.findOne(req.user.id);
                    if (userById) {
                        userById.google = profile.id;
                        userById.tokens.push(JSON.stringify({
                            kind: "google",
                            accessToken,
                            accessTokenExpires: moment().add(params.expires_in, "seconds").format(),
                            refreshToken,
                        }));
                        userById.profile_name = userById.profile_name || profile.displayName;
                        userById.profile_gender = userById.profile_gender || profile._json.gender;
                        userById.profile_picture = userById.profile_picture || profile._json.picture;
                        await repo.save(userById);
                        req.flash("info", {msg: "Google account has been linked."});
                        done(null, userById);
                    }
                    const userByEmail = await repo.findOne({email: profile.emails[0].value});
                    if (userByEmail) {
                        let msg2 = "There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.";
                        req.flash("errors", {msg: msg2});
                        done(msg2);
                    }
                }
            }
            const user = new User();
            user.email = profile.emails[0].value;
            user.google = profile.id;
            user.tokens.push(JSON.stringify({
                kind: "google",
                accessToken,
                accessTokenExpires: moment().add(params.expires_in, "seconds").format(),
                refreshToken,
            }));
            user.profile_name = profile.displayName;
            user.profile_gender = profile._json.gender;
            user.profile_picture = profile._json.picture;
            repo.save(user)
            done(null, user)
        });
    */
    /*
        passport.use("google", googleStrategyConfig);
        refresh.use("google", googleStrategyConfig);
    */

    /**
     * Sign in with LinkedIn.
     */
    /*
    passport.use(new LinkedInStrategy({
      clientID: process.env.LINKEDIN_ID,
      clientSecret: process.env.LINKEDIN_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/linkedin/callback`,
      scope: ["r_liteprofile", "r_emailaddress"],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        User.findOne({ linkedin: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            req.flash("errors", { msg: "There is already a LinkedIn account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.linkedin = profile.id;
              user.tokens.push({ kind: "linkedin", accessToken });
              user.profile.name = user.profile.name || profile.displayName;
              user.profile.picture = user.profile.picture || profile.photos[3].value;
              user.save((err) => {
                if (err) { return done(err); }
                req.flash("info", { msg: "LinkedIn account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ linkedin: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            return done(null, existingUser);
          }
          User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
            if (err) { return done(err); }
            if (existingEmailUser) {
              req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with LinkedIn manually from Account Settings." });
              done(err);
            } else {
              const user = new User();
              user.linkedin = profile.id;
              user.tokens.push({ kind: "linkedin", accessToken });
              user.email = profile.emails[0].value;
              user.profile.name = profile.displayName;
              user.profile.picture = user.profile.picture || profile.photos[3].value;
              user.save((err) => {
                done(err, user);
              });
            }
          });
        });
      }
    }));

    */
    /**
     * Sign in with Instagram.
     */
    /*
    passport.use(new InstagramStrategy({
      clientID: process.env.INSTAGRAM_ID,
      clientSecret: process.env.INSTAGRAM_SECRET,
      callbackURL: "/auth/instagram/callback",
      passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {
      if (req.user) {
        User.findOne({ instagram: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            req.flash("errors", { msg: "There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.instagram = profile.id;
              user.tokens.push({ kind: "instagram", accessToken });
              user.profile.name = user.profile.name || profile.displayName;
              user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
              user.profile.website = user.profile.website || profile._json.data.website;
              user.save((err) => {
                req.flash("info", { msg: "Instagram account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ instagram: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            return done(null, existingUser);
          }
          const user = new User();
          user.instagram = profile.id;
          user.tokens.push({ kind: "instagram", accessToken });
          user.profile.name = profile.displayName;
          // Similar to Twitter API, assigns a temporary e-mail address
          // to get on with the registration process. It can be changed later
          // to a valid e-mail address in Profile Management.
          user.email = `${profile.username}@instagram.com`;
          user.profile.website = profile._json.data.website;
          user.profile.picture = profile._json.data.profile_picture;
          user.save((err) => {
            done(err, user);
          });
        });
      }
    }));

    */
    /**
     * Twitch API OAuth.
     */
    /*
    const twitchStrategyConfig = new TwitchStrategy({
      clientID: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/twitch/callback`,
      scope: ["user_read", "chat:read", "chat:edit", "whispers:read", "whispers:edit", "user:read:email"],
      passReqToCallback: true
    }, (req, accessToken, refreshToken, params, profile, done) => {
      if (req.user) {
        User.findOne({ twitch: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser && (existingUser.id !== req.user.id)) {
            req.flash("errors", { msg: "There is already a Twitch account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.twitch = profile.id;
              user.tokens.push({
                kind: "twitch",
                accessToken,
                accessTokenExpires: moment().add(params.expires_in, "seconds").format(),
                refreshToken,
              });
              user.profile.name = user.profile.name || profile.display_name;
              user.profile.email = user.profile.gender || profile.email;
              user.profile.picture = user.profile.picture || profile.profile_image_url;
              user.save((err) => {
                req.flash("info", { msg: "Twitch account has been linked." });
                done(err, user);
              });
            });
          }
        });
      } else {
        User.findOne({ twitch: profile.id }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            return done(null, existingUser);
          }
          User.findOne({ email: profile.email }, (err, existingEmailUser) => {
            if (err) { return done(err); }
            if (existingEmailUser) {
              req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Twtich manually from Account Settings." });
              done(err);
            } else {
              const user = new User();
              user.email = profile.email;
              user.twitch = profile.id;
              user.tokens.push({
                kind: "twitch",
                accessToken,
                accessTokenExpires: moment().add(params.expires_in, "seconds").format(),
                refreshToken,
              });
              user.profile.name = profile.display_name;
              user.profile.email = profile.email;
              user.profile.picture = profile.profile_image_url;
              user.save((err) => {
                done(err, user);
              });
            }
          });
        });
      }
    });
    passport.use("twitch", twitchStrategyConfig);
    refresh.use("twitch", twitchStrategyConfig);
    */

    /**
     * Tumblr API OAuth.
     */
    /*
    passport.use("tumblr", new OAuthStrategy({
      requestTokenURL: "https://www.tumblr.com/oauth/request_token",
      accessTokenURL: "https://www.tumblr.com/oauth/access_token",
      userAuthorizationURL: "https://www.tumblr.com/oauth/authorize",
      consumerKey: process.env.TUMBLR_KEY,
      consumerSecret: process.env.TUMBLR_SECRET,
      callbackURL: "/auth/tumblr/callback",
      passReqToCallback: true
    },
    (req, token, tokenSecret, profile, done) => {
      User.findById(req.user._id, (err, user) => {
        if (err) { return done(err); }
        user.tokens.push({ kind: "tumblr", accessToken: token, tokenSecret });
        user.save((err) => {
          done(err, user);
        });
      });
    }));

    */
    /**
     * Foursquare API OAuth.
     */
    /*
    passport.use("foursquare", new OAuth2Strategy({
      authorizationURL: "https://foursquare.com/oauth2/authorize",
      tokenURL: "https://foursquare.com/oauth2/access_token",
      clientID: process.env.FOURSQUARE_ID,
      clientSecret: process.env.FOURSQUARE_SECRET,
      callbackURL: process.env.FOURSQUARE_REDIRECT_URL,
      passReqToCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
      User.findById(req.user._id, (err, user) => {
        if (err) { return done(err); }
        user.tokens.push({ kind: "foursquare", accessToken });
        user.save((err) => {
          done(err, user);
        });
      });
    }));

    */
    /**
     * Steam API OpenID.
     */
    /*
    passport.use(new OpenIDStrategy({
      apiKey: process.env.STEAM_KEY,
      providerURL: "http://steamcommunity.com/openid",
      returnURL: `${process.env.BASE_URL}/auth/steam/callback`,
      realm: `${process.env.BASE_URL}/`,
      stateless: true,
      passReqToCallback: true,
    }, (req, identifier, done) => {
      const steamId = identifier.match(/\d+$/)[0];
      const profileURL = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_KEY}&steamids=${steamId}`;

      if (req.user) {
        User.findOne({ steam: steamId }, (err, existingUser) => {
          if (err) { return done(err); }
          if (existingUser) {
            req.flash("errors", { msg: "There is already an account associated with the SteamID. Sign in with that account or delete it, then link it with your current account." });
            done(err);
          } else {
            User.findById(req.user.id, (err, user) => {
              if (err) { return done(err); }
              user.steam = steamId;
              user.tokens.push({ kind: "steam", accessToken: steamId });
              axios.get(profileURL)
                .then((res) => {
                  const profile = res.data.response.players[0];
                  user.profile.name = user.profile.name || profile.personaname;
                  user.profile.picture = user.profile.picture || profile.avatarmedium;
                  user.save((err) => {
                    done(err, user);
                  });
                })
                .catch((err) => {
                  user.save((err) => { done(err, user); });
                  done(err, null);
                });
            });
          }
        });
      } else {
        axios.get(profileURL)
          .then(({ data }) => {
            const profile = data.response.players[0];
            const user = new User();
            user.steam = steamId;
            user.email = `${steamId}@steam.com`; // steam does not disclose emails, prevent duplicate keys
            user.tokens.push({ kind: "steam", accessToken: steamId });
            user.profile.name = profile.personaname;
            user.profile.picture = profile.avatarmedium;
            user.save((err) => {
              done(err, user);
            });
          }).catch((err) => {
            done(err, null);
          });
      }
    }));

    */
    /**
     * Pinterest API OAuth.
     */
    /*
    passport.use("pinterest", new OAuth2Strategy({
      authorizationURL: "https://api.pinterest.com/oauth/",
      tokenURL: "https://api.pinterest.com/v1/oauth/token",
      clientID: process.env.PINTEREST_ID,
      clientSecret: process.env.PINTEREST_SECRET,
      callbackURL: process.env.PINTEREST_REDIRECT_URL,
      passReqToCallback: true
    },
    (req, accessToken, refreshToken, profile, done) => {
      User.findById(req.user._id, (err, user) => {
        if (err) { return done(err); }
        user.tokens.push({ kind: "pinterest", accessToken });
        user.save((err) => {
          done(err, user);
        });
      });
    }));

    */
    /**
     * Intuit/QuickBooks API OAuth.
     */
    /*
    const quickbooksStrategyConfig = new OAuth2Strategy({
      authorizationURL: "https://appcenter.intuit.com/connect/oauth2",
      tokenURL: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      clientID: process.env.QUICKBOOKS_CLIENT_ID,
      clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/quickbooks/callback`,
      passReqToCallback: true
    },
    (res, accessToken, refreshToken, params, profile, done) => {
      User.findById(res.user._id, (err, user) => {
        if (err) { return done(err); }
        user.quickbooks = res.query.realmId;
        if (user.tokens.filter((vendor) => (vendor.kind === "quickbooks"))[0]) {
          user.tokens.some((tokenObject) => {
            if (tokenObject.kind === "quickbooks") {
              tokenObject.accessToken = accessToken;
              tokenObject.accessTokenExpires = moment().add(params.expires_in, "seconds").format();
              tokenObject.refreshToken = refreshToken;
              tokenObject.refreshTokenExpires = moment().add(params.x_refresh_token_expires_in, "seconds").format();
              if (params.expires_in) tokenObject.accessTokenExpires = moment().add(params.expires_in, "seconds").format();
              return true;
            }
            return false;
          });
          user.markModified("tokens");
          user.save((err) => { done(err, user); });
        } else {
          user.tokens.push({
            kind: "quickbooks",
            accessToken,
            accessTokenExpires: moment().add(params.expires_in, "seconds").format(),
            refreshToken,
            refreshTokenExpires: moment().add(params.x_refresh_token_expires_in, "seconds").format()
          });
          user.save((err) => { done(err, user); });
        }
      });
    });
    passport.use("quickbooks", quickbooksStrategyConfig);
    refresh.use("quickbooks", quickbooksStrategyConfig);
    */

    /**
     * Login Required middleware.
     */
}

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};

/**
 * Authorization Required middleware.
 */
export const isAuthorized = (req, res, next) => {
    const provider = req.path.split("/")[2];
    const token = req.user.tokens.find((token) => token.kind === provider);
    if (token) {
        // Is there an access token expiration and access token expired?
        // Yes: Is there a refresh token?
        //     Yes: Does it have expiration and if so is it expired?
        //       Yes, Quickbooks - We got nothing, redirect to res.redirect(`/auth/${provider}`);
        //       No, Quickbooks and Google- refresh token and save, and then go to next();
        //    No:  Treat it like we got nothing, redirect to res.redirect(`/auth/${provider}`);
        // No: we are good, go to next():
        if (token.accessTokenExpires && moment(token.accessTokenExpires).isBefore(moment().subtract(1, "minutes"))) {
            if (token.refreshToken) {
                if (token.refreshTokenExpires && moment(token.refreshTokenExpires).isBefore(moment().subtract(1, "minutes"))) {
                    res.redirect(`/auth/${provider}`);
                } else {
                    refresh.requestNewAccessToken(`${provider}`, token.refreshToken, (err, accessToken, refreshToken, params) => {
                        // @ts-ignore
                        User.findById(req.user.id, (err, user) => {
                            user.tokens.some((tokenObject) => {
                                if (tokenObject.kind === provider) {
                                    tokenObject.accessToken = accessToken;
                                    if (params.expires_in) tokenObject.accessTokenExpires = moment().add(params.expires_in, "seconds").format();
                                    return true;
                                }
                                return false;
                            });
                            req.user = user;
                            user.markModified("tokens");
                            user.save((err) => {
                                if (err) console.log(err);
                                next();
                            });
                        });
                    });
                }
            } else {
                res.redirect(`/auth/${provider}`);
            }
        } else {
            next();
        }
    } else {
        res.redirect(`/auth/${provider}`);
    }
};
