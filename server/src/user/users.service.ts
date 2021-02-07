import {Injectable} from '@nestjs/common';
import {User} from '../entities/user.entity';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateUserDto} from "./create-user.dto";
import {Profiles} from "../types/custom";
import axios from "axios";
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {
    }


    /**
     * Creates a user with a username and password
     */
    async signUpBasicUser(
        {email, password}: CreateUserDto,
        currentUser: User | undefined
    ): Promise<User> {
        if (await this.findOne({email})) {
            throw new Error("This email has already been used")
        }
        if (currentUser) {
            if (!currentUser.is_anonymous) {
                throw new Error("This user account has already been linked via another authentication method");
            }
            currentUser.email = email;
            currentUser.password = password;
            return await this.usersRepository.save(currentUser);
        }
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

    async upsertUserByEmailAndProvider(
        email: string,
        provider: 'keycloak',
        providerIdValue: string,
        currentUser: User | undefined
    ): Promise<User> {
        const userWithTheSameEmail = await this.findOne({email});
        if (userWithTheSameEmail) {
            if (userWithTheSameEmail.reserved_for_provider === provider) {
                return this.linkUserToProvider(userWithTheSameEmail, provider, providerIdValue);
            }
            const providerDoesntMatch = userWithTheSameEmail[provider] !== providerIdValue;
            if (providerDoesntMatch) {
                throw new Error("This email account has already been registered with a different provider")
            }
            return userWithTheSameEmail;
        }
        return this.usersRepository.save(
            Object.assign(
                currentUser || new User(),
                {
                    email,
                    [provider]: providerIdValue
                }
            )
        )
    }

    private linkUserToProvider(user: User, provider: "keycloak" , providerIdValue: string) {
        // Link this user
        user[provider] = providerIdValue;
        return this.usersRepository.save(
            user
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

    async createAnonymousUser() {
        const result = await this.usersRepository.insert(this.usersRepository.create({is_anonymous: true}));
        return await this.usersRepository.findOne(result.identifiers[0].id);
    }
}