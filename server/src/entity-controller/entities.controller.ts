import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { UserFromReq } from "../decorators/userFromReq";
import { User } from "../entities/user.entity";
import {LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository} from "typeorm";
import { EntitiesService } from "./entities.service";
import { AnonymousGuard } from "../guards/anonymous.guard";


export type RepositoryType = { view: Repository<any>; write: Repository<any> }

interface SerializedSelect<T extends Record<string, any>> {
    where: Partial<T>;
    skip?: number;
    take?: number;
    order: {
        [key: string]: "ASC" | "DESC";
    };
}

const processGteLte = (where: Record<string, any>) => {
    Object.entries(where).forEach(([key, value]: [string, any]) => {
        if (value?.gte !== undefined) {
            where[key] = MoreThanOrEqual(value.gte);
        }
        if (value?.lte !== undefined) {
            where[key] = LessThanOrEqual(value.lte);
        }
        if (value?.gt !== undefined) {
            where[key] = MoreThan(value.gt);
        }
        if (value?.lt !== undefined) {
            where[key] = LessThan(value.lt);
        }
    });
};

@Controller("/api/entities")
export class EntitiesController {
    constructor(
        private repositoryControllerService: EntitiesService,
    ) {
    }

    @Get(":entity")
    @UseGuards(AnonymousGuard)
    async get(
        @UserFromReq() user: User,
        @Param("entity") entity: string,
        @Req() request: Express.Request,
    ) {
        const foundEntity = this.resolveEntity(entity);
        // @ts-ignore
        const query: { [key: string]: string } = request.query;
        const {where, skip, take, order} = Object.fromEntries(
            Object.entries(query)
                .map(([key, serialized]) => [
                        key,
                        JSON.parse(serialized),
                    ],
                ),
        ) as SerializedSelect<any>;

        processGteLte(where);
        where.creator_id = user.id;
        // @ts-ignore
        return await foundEntity.view.find({
            where: [
                where
            ],
            skip,
            take,
            order
        });
    }

    @Post(":entity")
    async post(
        @UserFromReq() user: User,
        @Param("entity") entity: string,
        @Body() body: Record<string, any>,
    ) {
        const foundEntity = this.resolveEntity(entity);
        console.log(user);
        if (!user) {
            throw new Error("Authentication required in to persist entities, shouldn't you be an anonymous user though?");
        }
        body.creator_id = user.id;
        delete body.id;
        delete body.created_at;
        console.log(body);
        return await foundEntity.write.save(body);
    }

    private resolveEntity<T>(entity: string): {view: Repository<T>; write: Repository<T>} {
        if (!entity) {
            throw new Error("No entity provided to entities controller method");
        }
        const foundEntity = this.repositoryControllerService.entityMap[entity];
        if (!foundEntity) {
            throw new Error(`Unknown entity ${entity}`);
        }
        if ((foundEntity as RepositoryType).view) {
            return foundEntity as RepositoryType;
        }
        // @ts-ignore
        return {view: foundEntity, write: foundEntity};
    }

}