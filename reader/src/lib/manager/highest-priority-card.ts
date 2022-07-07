import { ICard } from "languagetrainer-server/src/shared"

export const highestPriorityCard = (c1: ICard, c2: ICard) => {
    /*
    const ordered = orderBy([c1, c2], ['id', 'timestamp'], ['desc', 'desc']);
*/
    return [c1, c2].find((c) => c.id) || c1
}