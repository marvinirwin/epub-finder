import {Connection, Repository} from "typeorm";
import {JsonCache} from "../entities/JsonCache";
import {Session} from "../entities/Session";
import {User} from "../entities/User";
import {UsageEvent} from "../entities/UsageEvent";
import {VisitorLog} from "../entities/VisitorLog";

export class Repositories {
    jsonCache: Repository<JsonCache>;
    session: Repository<Session>;
    user: Repository<User>;
    usageEvent: Repository<UsageEvent>;
    private visitorLog: Repository<VisitorLog>;
    constructor(public connection: Connection) {
        this.jsonCache = connection.getRepository(JsonCache);
        this.usageEvent = connection.getRepository(UsageEvent);
        this.user = connection.getRepository(User);
        this.visitorLog = connection.getRepository(VisitorLog);
        this.session = connection.getRepository(Session);
    }
}

