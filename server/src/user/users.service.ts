import {Injectable} from '@nestjs/common';
import {User} from '../entities/user.entity';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateUserDto} from "./create-user.dto";
import {Profiles} from "../types/custom";
import GoogleProfile = Profiles.GoogleProfile;

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }


    /**
     * Creates a user with a username and password
     */
/*
    async createBasicUser({email, password}: CreateUserDto): Promise<User> {
        return this.usersRepository.save(
            Object.assign(
                new User(),
                {
                    email,
                    password
                }
            )
        )
    }
*/

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findOne(args): Promise<User> {
        return this.usersRepository.findOne(args);
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }

    /**
     * TODO make this descriminate by email and throw an error if you attempt to use an email
     *
     * @param email
     */
    async upsertUserByEmail(email: string): Promise<User> {
        const user = await this.findOne({email});
        if (user) {
            return user;
        }

        return this.usersRepository.save(
            Object.assign(
                new User(),
                {
                    email
                }
            )
        )
    }

    async profile() {

    }
}