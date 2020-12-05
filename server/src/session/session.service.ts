import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import { session } from "src/entities/session.entity";

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(session)
        public sessionRepository: Repository<session>) {
    }
}
