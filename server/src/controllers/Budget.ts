import { Request, Response, NextFunction,  } from "express";
// @ts-ignore
import User from '../entities/User';
import {Connection} from "typeorm";

export const enforceBudget = (connection: Connection) => (req: Express.Request, res: Response, next: NextFunction) => {
    const user = req.user as User;
    const usedBudget = user;
    const maxBudget = user.maxBudget;
    // @ts-ignore
    const cost = JSON.stringify(req.body).length;
    if ((usedBudget + cost) > maxBudget) {
        // @ts-ignore
        res.status(402).send(`You have used your entire "budget" of services, email marvin@marvinirwin.com if you would like some more`)
    } else {
        user.usedBudget += cost;
/*
        (User as Mongoose.Model<ExpressUser>).findByIdAndUpdate(user.id, user)
*/
        next();
    }
}
