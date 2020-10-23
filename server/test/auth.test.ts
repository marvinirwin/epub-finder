import request from 'supertest';
import connectedApp from '../src/app'
import connectionPromise from './connection';
import {Connection, Repository} from "typeorm";
import {User} from "../src/entities/User";
import {Express} from "express";
import {VisitorLog} from "../src/entities/VisitorLog";

let connection: Connection;
let app: Express;
let userRepo: Repository<User>;
let visitorRepo: Repository<VisitorLog>;
const email = 'test@test.com';
const password = 'password';

describe('logging in and out', () => {
    beforeAll(async () => {
        app = await connectedApp();
    });
    beforeEach(async () => {
        connection = await connectionPromise('test');
        userRepo = connection.getRepository(User);
        visitorRepo = connection.getRepository(VisitorLog);
        await visitorRepo.clear();
        // Create a test user
        const testUser = new User();
        testUser.email = email;
        testUser.password = password;
        await userRepo.delete({email});
        await userRepo.save(testUser);
    });

    it('Should be able to login with a local user', done => {
        request(app)
            .post('/auth/local')
            .send({email, password})
            .expect(200, done)
    });

    it('Should be given an ip user if no ip events were present', done => {
        const IP = '127.0.0.1';
        request(app)
            .post('/translate')
            .send(
                {
                    from: 'zh-CN',
                    to: 'en',
                    text: "今天"
                }
            )
            .set('x-forwarded-for', IP)
            .expect(200, async () => {
                // Now expect that there is an ip user with that ip
                const ipUser = await userRepo.findOne({ip: IP})
                expect(ipUser).toBeTruthy()
                done();
            });
    });
})
