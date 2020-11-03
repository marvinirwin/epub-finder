import {Injectable} from "@nestjs/common";
import {SpeechSynthesisRequestDto} from "../speech/speech-synthesis-request-dto";
import {InjectRepository} from "@nestjs/typeorm";
import {JsonCache} from "../entities/JsonCache";
import {Repository} from "typeorm";
import { Session } from "src/entities/Session";

@Injectable()
export class SessionService {
    constructor(
        @InjectRepository(JsonCache)
        public sessionRepository: Repository<Session>) {
    }
}
