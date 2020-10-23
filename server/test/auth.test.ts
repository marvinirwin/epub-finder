import request from 'supertest';
import connectedApp from '../src/app'
import connectionPromise from './connection';
import {Connection} from "typeorm";
import {User} from "../src/entities/User";
import {Express} from "express";

let connection: Connection;
let app: Express;
const email = 'test@test.com';
const password = 'password';

describe('logging in and out', () => {
    beforeAll(async () => {
        app = await connectedApp();
    });
    beforeEach(async () => {
        connection = await connectionPromise('test');

        const userRepo = connection.getRepository(User);
        // Create a test user
        const testUser = new User();
        testUser.email = email;
        testUser.password = password;
        await userRepo.delete({email: email});
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
            .get('/translate')
            .set('x-forwarded-for', IP)
            .expect(200, done);
    });
})
