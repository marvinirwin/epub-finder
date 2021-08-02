import { LeaderBoardService } from "./leader-board.service";
import {
    Controller,
    Get,
    Header,
    Param,
} from "@nestjs/common";

@Controller("leader-board")
export class LeaderBoardController {
    constructor(private leaderBoardService: LeaderBoardService) {}

    @Get("")
    @Header("content-type", "application/json")
    async getLeaderBoard() {
        return (
            await this.leaderBoardService.getLeaderBoard()
        );
    }
}
