import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {JsonCache} from "../entities/JsonCache";
import {Repository} from "typeorm";
import { Session } from "src/entities/Session";

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(Session)
        public sessionRepository: Repository<Session>) {
    }
}
