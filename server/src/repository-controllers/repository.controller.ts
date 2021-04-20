import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { UserFromReq } from '../decorators/userFromReq'
import { User } from '../entities/user.entity'
import { UserSetting } from '../entities/user-setting.entity'
import { Card } from 'src/entities/card.entity'
import { SpacedRepitionEntity } from '../entities/spaced-repitition-record.entity'
import { IgnoredWord } from '../entities/ignored-word.entity'
import { CustomWord } from '../entities/custom-word.entity'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'


class RepositoryControllerService {
    public entityMap: {
        [key: string]: Repository<any>
    }

    constructor(
        @InjectRepository(UserSetting)
        public userSettings: Repository<UserSetting>,
        @InjectRepository(Card)
        public cards: Repository<Card>,
        @InjectRepository(SpacedRepitionEntity)
        public spacedRepitionEntities: Repository<SpacedRepitionEntity>,
        @InjectRepository(IgnoredWord)
        public ignoredWords: Repository<IgnoredWord>,
        @InjectRepository(CustomWord)
        public customWords: Repository<CustomWord>,
    ) {
        this.entityMap = {
            userSettings,
            cards,
            spacedRepitionEntities,
            ignoredWords,
            customWords,
        }
    }
}

interface SerializedSelect<T extends Record<string, any>> {
    where: Partial<T>,
    skip?: number;
    take?: number;
    order: {
        [key: string]: 'ASC' | 'DESC'
    }
}

@Controller('entities')
export class RepositoryController {
    constructor(
        private repositoryControllerService: RepositoryControllerService,
    ) {
    }

    @Get(':entity')
    async get(
        @UserFromReq() user: User,
        @Param('entity') entity: string,
        @Req() request: Request,
    ) {
        const foundEntity = this.resolveEntity(entity)
        // @ts-ignore
        const query: { [key: string]: string } = request.query
        const {where, skip, take, order} = Object.fromEntries(
            Object.entries(query)
                .map(([key, serialized]) => [
                        key,
                        JSON.parse(serialized),
                    ],
                ),
        ) as SerializedSelect<any>
        where.user_id = user.id;
        return await foundEntity.find({
            where: [
                where
            ],
            skip,
            take,
            order
        });
    }

    @Post(':entity')
    async post(
        @UserFromReq() user: User,
        @Param('entity') entity: string,
        @Body() body: Record<string, any>,
    ) {
        const foundEntity = this.resolveEntity(entity);
        if (!user) {
            throw new Error(`Authentication required in to persist entities, shouldn't you be an anonymous user thought?`)
        }
        body.user_id = user.id;
        delete body.id;
        return await foundEntity.save(body)
    }

    private resolveEntity(entity: string) {
        if (!entity) {
            throw new Error(`No entity provided to entities controller method`)
        }
        const foundEntity = this.repositoryControllerService.entityMap[entity]
        if (!foundEntity) {
            throw new Error(`Unknown entity ${entity}`)
        }
        return foundEntity
    }

}