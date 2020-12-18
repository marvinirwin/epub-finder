import {Controller, Get, Post, Body, UseGuards} from '@nestjs/common';
import {LoggedInGuard} from "../guards/logged-in.guard";
import {UserFromReq} from "../decorators/userFromReq";
import {User} from "../entities/user.entity";
import {DocumentsService} from "../documents/documents.service";
import {RecordRequestService} from "./record-request.service";

export type RecordRequestDto = string[];

@Controller('record-request')
export class RecordRequestController {
    constructor(
        private recordRequestService: RecordRequestService
    ) {}

    @Post()
    @UseGuards(LoggedInGuard)
    async submitRecordRequests(
        @UserFromReq() user: User,
        @Body() recordRequestDto: RecordRequestDto
    ) {
        return this.recordRequestService.persistUsersRecordRequests(recordRequestDto, user)
    }

    @Get()
    @UseGuards(LoggedInGuard)
    async myRecordRequests(
        @UserFromReq() user: User,
    ) {
        return this.recordRequestService.queryRecordRequestsForUser(user)
    }
}
