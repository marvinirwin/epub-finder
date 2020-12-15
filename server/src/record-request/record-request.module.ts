import {Module} from "@nestjs/common";
import {UsersModule} from "../user/user.module";
import {PassportModule} from "@nestjs/passport";
import {RecordRequestController} from "./record-request.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../entities/user.entity";
import {RecordRequest} from "../entities/record-request.entity";
import {RecordRequestService} from "./record-request.service";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TypeOrmModule.forFeature([User, RecordRequest])
    ],
    providers: [
        RecordRequestService
    ],
    controllers: [
        RecordRequestController
    ],
})
export class RecordRequestModule {
}
