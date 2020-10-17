import request from 'supertest';
import app from '../src/app'
import connectionPromise from './connection';
import {Connection} from "typeorm";
import {User} from "../src/entities/User";


let connection: Connection;
describe('logging in and out', () => {
    beforeEach(async () => {
        connection = await connectionPromise;
        const userRepo = connection.getRepository(User);
        // Create a test user
        const testUser = new User();
        testUser.email = 'test@test.com';
        testUser.password = 'password';
        await userRepo.delete({email: 'test@test.com'});
        await userRepo.save(testUser);
    });

    it('Should be able to login', async () => {

    })
})
describe("GET /", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/")
            .expect(200, done);
    });
});

describe("GET /login", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/login")
            .expect(200, done);
    });
});

describe("GET /signup", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/signup")
            .expect(200, done);
    });
});

describe("GET /forgot", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/forgot")
            .expect(200, done);
    });
});

describe("GET /api", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api")
            .expect(200, done);
    });
});

describe("GET /contact", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/contact")
            .expect(200, done);
    });
});

describe("GET /api/lastfm", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/lastfm")
            .expect(200, done);
    });
});

describe("GET /api/twilio", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/twilio")
            .expect(200, done);
    });
});

describe("GET /api/stripe", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/stripe")
            .expect(200, done);
    });
});

describe("GET /api/scraping", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/scraping")
            .expect(200, done);
    });
});

describe("GET /api/lob", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/lob")
            .expect(200, done);
    });
});

describe("GET /api/clockwork", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/clockwork")
            .expect(200, done);
    });
});

describe("GET /api/upload", () => {
    it("should return 200 OK", (done) => {
        request(app)
            .get("/api/upload")
            .expect(200, done);
    });
});

describe("GET /random-url", () => {
    it("should return 404", (done) => {
        request(app)
            .get("/reset")
            .expect(404, done);
    });
});
