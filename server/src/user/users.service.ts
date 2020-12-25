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
    async createBasicUser({email, password}: CreateUserDto): Promise<User> {
        await this.usersRepository.insert(this.usersRepository.create({email, password}));
        return this.usersRepository.findOneOrFail({email});
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

    /**
     * TODO make this descriminate by email and throw an error if you attempt to use an email
     *
     * @param email
     */
    async upsertUserByEmailAndProvider(email: string, provider: 'google' | 'twitter', providerIdValue: string): Promise<User> {
        const user = await this.findOne({email});
        if (user) {
            const providerMatches = user[provider] !== providerIdValue;
            if (providerMatches) {
                throw new Error("This email account has already been registered with a different provider")
            }
            return user;
        }

        return this.usersRepository.save(
            Object.assign(
                new User(),
                {
                    email,
                    [provider]: providerIdValue
                }
            )
        )
    }

    async profile() {
    }

    async findForAuth(email: string, password: string): Promise<User | undefined> {
        const user = await this.usersRepository.findOne({email});
        if (user && await User.comparePassword(user.password, password)) {
            return user;
        }
    }
}