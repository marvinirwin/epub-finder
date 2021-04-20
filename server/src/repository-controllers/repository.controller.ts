import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common'
import { UserFromReq } from '../decorators/userFromReq'
import { User } from '../entities/user.entity'
import { Repository } from 'typeorm'
import { RepositoryService } from './repository.service'


export type RepositoryType = { view: Repository<any>, write: Repository<any> }

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
        private repositoryControllerService: RepositoryService,
    ) {
    }

    @Get(':entity')
    async get(
        @UserFromReq() user: User,
        @Param('entity') entity: string,
        @Req() request: Express.Request,
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
        return await foundEntity.view.find({
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
        return await foundEntity.write.save(body)
    }

    private resolveEntity<T>(entity: string): {view: Repository<T>, write: Repository<T>} {
        if (!entity) {
            throw new Error(`No entity provided to entities controller method`)
        }
        const foundEntity = this.repositoryControllerService.entityMap[entity]
        if (!foundEntity) {
            throw new Error(`Unknown entity ${entity}`)
        }
        if ((foundEntity as RepositoryType).view) {
            return foundEntity as RepositoryType;
        }
        // @ts-ignore
        return {view: foundEntity, write: foundEntity}
    }

}