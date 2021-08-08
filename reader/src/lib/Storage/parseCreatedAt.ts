import {parseISO} from "date-fns";

export function parseCreatedAt<T extends { created_at: string }>(item: T) {
    return ({...item, created_at: parseISO(`${item.created_at.toString()}Z`)})
}