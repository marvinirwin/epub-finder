import { Request, Response, NextFunction,  } from "express";
// @ts-ignore
import User from '../models/User';

export interface ExpressUser {
    email: string,
    password: string,
    passwordResetToken: string,
    passwordResetExpires: Date,
    emailVerificationToken: string,
    emailVerified: boolean,

    snapchat: string,
    facebook: string,
    twitter: string,
    google: string,
    github: string,
    instagram: string,
    linkedin: string,
    steam: string,
    twitch: string,
    quickbooks: string,
    tokens: string[],

    usedBudget: number,
    maxBudget: number,


    profile: {
        name: string,
        gender: string,
        location: string,
        website: string,
        picture: string
    }

}

export const enforceBudget = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as ExpressUser ;
    const usedBudget = user.usedBudget;
    const maxBudget = user.maxBudget;
    const cost = JSON.stringify(req.body).length;
    if ((usedBudget + cost) > maxBudget) {
        res.status(402).send(`You have used your entire "budget" of services, email marvin@marvinirwin.com if you would like some more`)
    } else {
        user.usedBudget += cost;
/*
        (User as Mongoose.Model<ExpressUser>).findByIdAndUpdate(user.id, user)
*/
        next();
    }
}
