import { Strategy } from "passport-anonymous";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { UsersService } from "../../user/users.service";

@Injectable()
export class AnonymousStrategy extends PassportStrategy(Strategy, "anonymous") {
    constructor(private readonly userService: UsersService) {
        super();
    }
    async authenticate(request) {
        if (request.user) {
            return await this.success(request.user);
        }
        return await this.success(await this.userService.createAnonymousUser());
    }
}
