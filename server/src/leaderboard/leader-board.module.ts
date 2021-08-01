import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LeaderBoardController } from "./leader-board.controller";
import { LeaderBoardService } from "./leader-board.service";
import {SpacedRepitionEntity} from "../entities/spaced-repitition-record.entity";
import {User} from "src/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([SpacedRepitionEntity, User])],
    controllers: [LeaderBoardController],
    providers: [LeaderBoardService],
})
export class LeaderBoardModule {}
