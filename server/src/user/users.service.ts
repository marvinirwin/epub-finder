import {Injectable} from '@nestjs/common';
import {User} from '../entities/User';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateUserDto} from "./create-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }


    /**
     * Creates a user with a username and password
     */
    async createBasicUser({email, password}: CreateUserDto): Promise<User> {
        return this.usersRepository.create(
            Object.assign(
                new User(),
                {
                    email,
                    password
                }
            )
        )
    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findOne(args): Promise<User> {
        return this.usersRepository.findOne(args);
    }

    async remove(id: string): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async findForAuth(email, password) {
        const userWithThisEmail = await this.findOne({email});
        if (!userWithThisEmail) {
            return userWithThisEmail;
        }
        if (await User.comparePassword(userWithThisEmail.password, password)) {
            return userWithThisEmail;
        }
    }
}