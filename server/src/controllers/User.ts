import crypto from 'crypto';
import nodemailer from 'nodemailer';
import passport from 'passport';
import _ from 'lodash'
import validator from 'validator';
import mailChecker from 'mailchecker';
import {promisify} from "util";
import {Repository} from "typeorm";
import {User} from "../entities/user.entity";

const randomBytesAsync = promisify(crypto.randomBytes);

/**
 * POST /login
 * Sign in using email and password.
 */
export const postLogin = (repository: Repository<User>) => (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({msg: "Please enter a valid email address."});
    if (validator.isEmpty(req.body.password)) validationErrors.push({msg: "Password cannot be blank."});

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/login");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {gmail_remove_dots: false});

    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash("errors", info);
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", {msg: "Success! You are logged in."});
            res.redirect(req.session.returnTo || "/");
        });
    })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export const logout = (repository: Repository<User>) => (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        if (err) console.log("Error : Failed to destroy the session during logout.", err);
        req.user = null;
        res.redirect("/");
    });
};

/**
 * GET /signup
 * Signup page.
 */
export const getSignup = (repository: Repository<User>) => (req, res) => {
    if (req.user) {
        return res.redirect("/");
    }
    res.render("account/signup", {
        title: "Create Account"
    });
};

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = (repository: Repository<User>) => async (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({msg: "Please enter a valid email address."});
    if (!validator.isLength(req.body.password, {min: 8})) validationErrors.push({msg: "Password must be at least 8 characters long"});
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({msg: "Passwords do not match"});

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/signup");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {gmail_remove_dots: false});

    const user = new User();
    user.email = req.body.email;
    user.password = req.body.password;
    const existingUser = await repository.findOne({email: req.body.email});
    if (existingUser) {
        req.flash("errors", {msg: "Account with that email address already exists."});
        return res.redirect("/signup");
    }
    await repository.save(user);
    req.logIn(user, (err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};

/**
 * GET /account
 * Profile page.
 */
export const getAccount = (req, res) => {
    res.render("account/profile", {
        title: "Account Management"
    });
};

/**
 * POST /account/profile
 * Update profile information.
 */
/*
export const postUpdateProfile = (repository: Repository<User>) => async (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({msg: "Please enter a valid email address."});

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/account");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {gmail_remove_dots: false});

    const user = await repository.findOne(req.user.id);
    if (user.email !== req.body.email) user.emailVerified = false;
    user.email = req.body.email || "";
    user.profile_name = req.body.name || "";
    user.profile_gender = req.body.gender || "";
    user.profile_location = req.body.location || "";
    user.profile_website = req.body.website || "";

    await repository.save(user);

    if (err) {
        if (err.code === 11000) {
            req.flash("errors", {msg: "The email address you have entered is already associated with an account."});
            return res.redirect("/account");
        }
        return next(err);
    }
    req.flash("success", {msg: "Profile information has been updated."});
    res.redirect("/account");
};
*/

/**
 * POST /account/password
 * Update current password.
 */
export const postUpdatePassword = (repository: Repository<User>) => async (req, res, next) => {
    const validationErrors = [];
    if (!validator.isLength(req.body.password, {min: 8})) validationErrors.push({msg: "Password must be at least 8 characters long"});
    if (req.body.password !== req.body.confirmPassword) validationErrors.push({msg: "Passwords do not match"});

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/account");
    }
    const user = await repository.findOne(req.user.id);
    user.password = req.body.password;
    await repository.save(user);
    next();
};

/**
 * POST /account/delete
 * Delete user account.
 */
/*
export const postDeleteAccount = (repository: Repository<User>) => async (req, res, next) => {
    User.deleteOne({_id: req.user.id}, (err) => {
        if (err) {
            return next(err);
        }
        req.logout();
        req.flash("info", {msg: "Your account has been deleted."});
        res.redirect("/");
    });
};
*/

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
export const getOauthUnlink = (repository: Repository<User>) => async (req, res, next) => {
    const {provider} = req.params;
    const user = await repository.findOne(req.user.id);
    user[provider.toLowerCase()] = undefined;
    const tokensWithoutProviderToUnlink = user.tokens.filter((token) =>
        // @ts-ignore
        token.kind !== provider.toLowerCase());
    // Some auth providers do not provide an email address in the user profile.
    // As a result, we need to verify that unlinking the provider is safe by ensuring
    // that another login method exists.
    if (
        !(user.email && user.password)
        && tokensWithoutProviderToUnlink.length === 0
    ) {
        req.flash("errors", {
            msg: `The ${_.startCase(_.toLower(provider))} account cannot be unlinked without another form of login enabled.`
                + " Please link another account or add an email address and password."
        });
        return res.redirect("/account");
    }
    user.tokens = tokensWithoutProviderToUnlink;

    await repository.save(user);
/*
    user.save((err) => {
        if (err) {
            return next(err);
        }
        req.flash("info", {msg: `${_.startCase(_.toLower(provider))} account has been unlinked.`});
        res.redirect("/account");
    });
*/
    next();
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
/*
export const getReset = (repository: Repository<User>) => async (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    const validationErrors = [];
    if (!validator.isHexadecimal(req.params.token)) validationErrors.push({msg: "Invalid Token.  Please retry."});
    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/forgot");
    }
    const user = await repository.find({
        passwordResetToken: req.params.token,

    }).

    User
        .findOne({passwordResetToken: req.params.token})
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.flash("errors", {msg: "Password reset token is invalid or has expired."});
                return res.redirect("/forgot");
            }
            res.render("account/reset", {
                title: "Password Reset"
            });
        });
};
*/

/**
 * GET /account/verify/:token
 * Verify email address
 */
export const getVerifyEmailToken = (repository: Repository<User>) => async (req, res, next) => {
    if (req.user.emailVerified) {
        req.flash("info", {msg: "The email address has been verified."});
        return res.redirect("/account");
    }

    const validationErrors = [];
    if (req.params.token && (!validator.isHexadecimal(req.params.token))) validationErrors.push({msg: "Invalid Token.  Please retry."});
    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/account");
    }

    if (req.params.token === req.user.emailVerificationToken) {
        const user = await repository.findOne({email: req.user.email});
        if (!user) {
            req.flash("errors", {msg: "There was an error in loading your profile."});
            return res.redirect("back");
        }
        user.email_verification_token = "";
        user.email_verified = true;
        await repository.save(user);
        req.flash("info", {msg: "Thank you for verifying your email address."});
        return res.redirect("/account");
/*
        User
            .findOne()
            .then((user) => {
            })
            .catch((error) => {
                console.log("Error saving the user profile to the database after email verification", error);
                req.flash("errors", {msg: "There was an error when updating your profile.  Please try again later."});
                return res.redirect("/account");
            });
*/
    } else {
        req.flash("errors", {msg: "The verification link was invalid, or is for a different account."});
        return res.redirect("/account");
    }
};

/**
 * GET /account/verify
 * Verify email address
 */
export const getVerifyEmail = (repository: Repository<User>) => async (req, res, next) => {
    if (req.user.emailVerified) {
        req.flash("info", {msg: "The email address has been verified."});
        return res.redirect("/account");
    }

    if (!mailChecker.isValid(req.user.email)) {
        req.flash("errors", {msg: "The email address is invalid or disposable and can not be verified.  Please update your email address and try again."});
        return res.redirect("/account");
    }

    const createRandomToken = randomBytesAsync(16)
        .then((buf) => buf.toString("hex"));

    const setRandomToken = async (token) => {
        const user = await repository.findOne({email: req.user.email})
        user.email_verification_token = token;
        await repository.save(user);
        return token;
    };

    const sendVerifyEmail = (token) => {
        let transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
        const mailOptions = {
            to: req.user.email,
            from: "hackathon@starter.com",
            subject: "Please verify your email address on Hackathon Starter",
            text: `Thank you for registering with hackathon-starter.\n\n
        This verify your email address please click on the following link, or paste this into your browser:\n\n
        http://${req.headers.host}/account/verify/${token}\n\n
        \n\n
        Thank you!`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                req.flash("info", {msg: `An e-mail has been sent to ${req.user.email} with further instructions.`});
            })
            .catch((err) => {
                if (err.message === "self signed certificate in certificate chain") {
                    console.log("WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.");
                    transporter = nodemailer.createTransport({
                        service: "SendGrid",
                        auth: {
                            user: process.env.SENDGRID_USER,
                            pass: process.env.SENDGRID_PASSWORD
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    return transporter.sendMail(mailOptions)
                        .then(() => {
                            req.flash("info", {msg: `An e-mail has been sent to ${req.user.email} with further instructions.`});
                        });
                }
                console.log("ERROR: Could not send verifyEmail email after security downgrade.\n", err);
                req.flash("errors", {msg: "Error sending the email verification message. Please try again shortly."});
                return err;
            });
    };

    createRandomToken
        .then(setRandomToken)
        .then(sendVerifyEmail)
        .then(() => res.redirect("/account"))
        .catch(next);
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
/*
export const postReset = (repository: Repository<User>) => (req, res, next) => {
    const validationErrors = [];
    if (!validator.isLength(req.body.password, {min: 8})) validationErrors.push({msg: "Password must be at least 8 characters long"});
    if (req.body.password !== req.body.confirm) validationErrors.push({msg: "Passwords do not match"});
    if (!validator.isHexadecimal(req.params.token)) validationErrors.push({msg: "Invalid Token.  Please retry."});

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("back");
    }

    const resetPassword = () =>
        User
            .findOne({passwordResetToken: req.params.token})
            .where("passwordResetExpires").gt(Date.now())
            .then((user) => {
                if (!user) {
                    req.flash("errors", {msg: "Password reset token is invalid or has expired."});
                    return res.redirect("back");
                }
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                return user.save().then(() => new Promise((resolve, reject) => {
                    req.logIn(user, (err) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(user);
                    });
                }));
            });

    const sendResetPasswordEmail = (user) => {
        if (!user) {
            return;
        }
        let transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
        const mailOptions = {
            to: user.email,
            from: "hackathon@starter.com",
            subject: "Your Hackathon Starter password has been changed",
            text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                req.flash("success", {msg: "Success! Your password has been changed."});
            })
            .catch((err) => {
                if (err.message === "self signed certificate in certificate chain") {
                    console.log("WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.");
                    transporter = nodemailer.createTransport({
                        service: "SendGrid",
                        auth: {
                            user: process.env.SENDGRID_USER,
                            pass: process.env.SENDGRID_PASSWORD
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    return transporter.sendMail(mailOptions)
                        .then(() => {
                            req.flash("success", {msg: "Success! Your password has been changed."});
                        });
                }
                console.log("ERROR: Could not send password reset confirmation email after security downgrade.\n", err);
                req.flash("warning", {msg: "Your password has been changed, however we were unable to send you a confirmation email. We will be looking into it shortly."});
                return err;
            });
    };

    resetPassword()
        .then(sendResetPasswordEmail)
        .then(() => {
            if (!res.finished) res.redirect("/");
        })
        .catch((err) => next(err));
};
*/

/**
 * GET /forgot
 * Forgot Password page.
 */
export const getForgot = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.render("account/forgot", {
        title: "Forgot Password"
    });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
/*
export const postForgot = (repository: Repository<User>) => (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email)) validationErrors.push({msg: "Please enter a valid email address."});

    if (validationErrors.length) {
        req.flash("errors", validationErrors);
        return res.redirect("/forgot");
    }
    req.body.email = validator.normalizeEmail(req.body.email, {gmail_remove_dots: false});

    const createRandomToken = randomBytesAsync(16)
        .then((buf) => buf.toString("hex"));

    const setRandomToken = (token) =>
        User
            .findOne({email: req.body.email})
            .then((user) => {
                if (!user) {
                    req.flash("errors", {msg: "Account with that email address does not exist."});
                } else {
                    user.passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
                    user = user.save();
                }
                return user;
            });

    const sendForgotPasswordEmail = (user) => {
        if (!user) {
            return;
        }
        const token = user.passwordResetToken;
        let transporter = nodemailer.createTransport({
            service: "SendGrid",
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
        const mailOptions = {
            to: user.email,
            from: "hackathon@starter.com",
            subject: "Reset your password on Hackathon Starter",
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                req.flash("info", {msg: `An e-mail has been sent to ${user.email} with further instructions.`});
            })
            .catch((err) => {
                if (err.message === "self signed certificate in certificate chain") {
                    console.log("WARNING: Self signed certificate in certificate chain. Retrying with the self signed certificate. Use a valid certificate if in production.");
                    transporter = nodemailer.createTransport({
                        service: "SendGrid",
                        auth: {
                            user: process.env.SENDGRID_USER,
                            pass: process.env.SENDGRID_PASSWORD
                        },
                        tls: {
                            rejectUnauthorized: false
                        }
                    });
                    return transporter.sendMail(mailOptions)
                        .then(() => {
                            req.flash("info", {msg: `An e-mail has been sent to ${user.email} with further instructions.`});
                        });
                }
                console.log("ERROR: Could not send forgot password email after security downgrade.\n", err);
                req.flash("errors", {msg: "Error sending the password reset message. Please try again shortly."});
                return err;
            });
    };

    createRandomToken
        .then(setRandomToken)
        .then(sendForgotPasswordEmail)
        .then(() => res.redirect("/forgot"))
        .catch(next);
};
*/

export const getProfile = (req, res, next) => {
    res.json(req.user);
}