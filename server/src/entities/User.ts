import {Entity, Column, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;
    @Column({unique: true})
    email!: string; // { type: String, unique: true },
    @Column()
    password!: string;
    @Column()
    passwordResetToken!: string;
    @Column()
    passwordResetExpires!: Date;
    @Column()
    emailVerificationToken!: string;
    @Column()
    emailVerified!: boolean;
    @Column()
    snapchat!: string;
    @Column()
    facebook!: string;
    @Column()
    twitter!: string;
    @Column()
    google!: string;
    @Column()
    github!: string;
    @Column()
    instagram!: string;
    @Column()
    linkedin!: string;
    @Column()
    steam!: string;
    @Column()
    twitch!: string;
    @Column()
    quickbooks!: string;
    // I wonder what the ORM will do with this?
    @Column()
    tokens!: string[];
    @Column()
    usedBudget!: number;
    @Column()
    maxBudget!: number;
    @Column()
    profile_name!: string;
    @Column()
    profile_gender!: string;
    @Column()
    profile_location!: string;
    @Column()
    profile_website!: string;
    @Column()
    profile_picture!: string
}

/**
 * Password hash middleware.
 */
/*
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});
*/

/**
 * Set the budget TODO not hardcode this
 */
/*
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.usedBudget || !user.maxBudget) {
    user.usedBudget = 0;
    user.maxBudget = 250000; // About 5 dollars worth of google translated characters
  }
});
*/

/**
 * Helper method for validating user's password.
 */
/*
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};
*/

/**
 * Helper method for getting user's gravatar.
 */
/*
userSchema.methods.gravatar = function gravatar(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash("md5").update(this.email).digest("hex");
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};
*/

module.exports = User;
