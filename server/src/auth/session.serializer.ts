import {PassportSerializer} from "@nestjs/passport";
import {Injectable} from "@nestjs/common";
import {UsersService} from "../user/users.service";
import {User} from "../entities/user.entity";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly userService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, user: number) => void): void {
    done(null, user.id);
  }

  deserializeUser(id: number, done: (err: Error | null, payload?: User) => void): void {
    this.userService
      .findOne(`${id}`)
      .then(user => done(null, user))
      .catch(error => done(error));
  }
}
