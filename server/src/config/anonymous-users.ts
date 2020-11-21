import {Repositories} from "./repositories";
export default ({ user, session }: Repositories) => ({
/*
    async queryFreeSessionCount() {
        return await user.query(`
        SELECT COUNT(1) AS c
        FROM "user"
        JOIN "session" ON session.userId = user.id
        WHERE 
            session.expiresAt < current_timestamp
            AND user.email = ''
            AND user.tokens = ''
        GROUP BY user.id
        `);
    },
    async createAnonymousUser() {
        const anonymousUser = new User();
        return await user.save(anonymousUser);
    },
    async newSession(anonymousUser: User): Promise<Session> {
        const newSession = new Session()
        newSession.userId = anonymousUser.id;
        return session.save(newSession);
    },
    async assignAnonymousUser( ) {
        return async (req: Express.Request, res, next) => {
            // If the client has asked us to make an anonymous user for this request
            const shouldCreateAnonymousUser = req.header('Anonymous-User');
            if (!shouldCreateAnonymousUser) {
                next();
                return;
            }
            // First check if there are already N anonymous user sessions in progress
            const freeSessionCount = await this.queryFreeSessionCount();
            const MAX_FREE_SESSIONS = 1000;
            if (freeSessionCount > MAX_FREE_SESSIONS) {
                req.status(401).send({'message': `
            Free trials are disabled because there are too many in progress.  This shouldn't happen, trying again later might help
            `})
            }
            // Create an anonymous user
            const anonymousUser: User = await this.createAnonymousUser();
            // Put this userId on the req, passport should start sessions, right?
            // How does passport start a session?
            // I think I have to create a new session record
            const sessionRecord: Session = await this.newSession(anonymousUser);
            // I think this is how i cleverly inject a session
            req.sessionID = sessionRecord.id;
            req.userId = anonymousUser.id;
            next();
        };
    }
*/
})

