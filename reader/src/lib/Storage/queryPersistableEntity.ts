import {PersistableEntity} from "./database.service";
import {parseCreatedAt} from "./parseCreatedAt";

export const queryPersistableEntity = <T>(
    {
        entity,
        where,
        skip,
        take,
    }:
        {
            entity: PersistableEntity,
            where?: Partial<T>,
            skip?: number,
            take?: number
        },
): Promise<T[]> => {
    const url1 = `${window.location.origin}/entities/${entity}`
    const url = new URL(url1)
    url.search = new URLSearchParams({
            where: where ? JSON.stringify(where) : '{}',
            skip: `${skip}`,
            take: `${take}`,
        },
    ).toString()

    return fetch(url.toString())
        .then(response => {
          return response.json();
        })
        .then(items => items.map((item: T) => {
            // @ts-ignore
            return parseCreatedAt(item)
        }))
}