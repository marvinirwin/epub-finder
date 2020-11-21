import {Connection, Repository} from "typeorm";
import {JsonCacheEntity} from "../entities/json-cache.entity";
import {SessionEntity} from "../entities/session.entity";
import {UserEntity} from "../entities/user.entity";
import {UsageEventEntity} from "../entities/usage-event.entity";
import {VisitorLogEntity} from "../entities/visitor-log.entity";

export class Repositories {
    jsonCache: Repository<JsonCacheEntity>;
    session: Repository<SessionEntity>;
    user: Repository<UserEntity>;
    usageEvent: Repository<UsageEventEntity>;
    private visitorLog: Repository<VisitorLogEntity>;
    constructor(public connection: Connection) {
        this.jsonCache = connection.getRepository(JsonCacheEntity);
        this.usageEvent = connection.getRepository(UsageEventEntity);
        this.user = connection.getRepository(UserEntity);
        this.visitorLog = connection.getRepository(VisitorLogEntity);
        this.session = connection.getRepository(SessionEntity);
    }
}

