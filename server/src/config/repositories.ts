import {Connection, Repository} from "typeorm";
import {JsonCache} from "../entities/json-cache.entity";
import {session} from "../entities/session.entity";
import {User} from "../entities/user.entity";
import {UsageEvent} from "../entities/usage-event.entity";
import {VisitorLog} from "../entities/visitor-log.entity";

export class Repositories {
    jsonCache: Repository<JsonCache>;
    session: Repository<session>;
    user: Repository<User>;
    usageEvent: Repository<UsageEvent>;
    private visitorLog: Repository<VisitorLog>;
    constructor(public connection: Connection) {
        this.jsonCache = connection.getRepository(JsonCache);
        this.usageEvent = connection.getRepository(UsageEvent);
        this.user = connection.getRepository(User);
        this.visitorLog = connection.getRepository(VisitorLog);
        this.session = connection.getRepository(session);
    }
}

