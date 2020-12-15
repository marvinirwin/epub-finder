import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {JsonCache} from "../entities/json-cache.entity";
import {Repository} from "typeorm";
import {RecordRequest} from "../entities/record-request.entity";
import {User} from "../entities/user.entity";

@Injectable()
export class RecordRequestService {
    constructor(
        @InjectRepository(RecordRequest)
        private recordRequestRepository: Repository<RecordRequest>,
    ) {
    }


    public async persistUsersRecordRequests(sentences: string[], user: User) {
        this.recordRequestRepository.save(sentences.map(sentence => ({
            sentence,
            user_id: user.id
        })))
    }

    public async queryRecordRequestsForUser(user: User) {
        return this.recordRequestRepository.find({user_id: user.id})
            .then(records => records.map(({sentence}) => sentence))
    }
}
