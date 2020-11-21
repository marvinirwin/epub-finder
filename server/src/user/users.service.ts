import {Injectable} from '@nestjs/common';
import {UserEntity} from '../entities/user.entity';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateUserDto} from "./create-user.dto";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private usersRepository: Repository<UserEntity>,
    ) { }


    /**
     * Creates a user with a username and password
     */
    async createBasicUser({email, password}: CreateUserDto): Promise<UserEntity> {
        return this.usersRepository.create(
            Object.assign(
                new UserEntity(),
                {
                    email,
                    password
                }
            )
        )
    }

    findAll(): Promise<UserEntity[]> {
        return this.usersRepository.find();
    }

    findOne(args): Promise<UserEntity> {
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
        if (await UserEntity.comparePassword(userWithThisEmail.password, password)) {
            return userWithThisEmail;
        }
    }
}