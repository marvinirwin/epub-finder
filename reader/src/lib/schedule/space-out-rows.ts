import { safePushMap } from '@shared/'

export const spaceOutRows = <T, U, V>(
    resolveTypes: (v: T) => {
        type: U,
        subType: V,
        sortValue: number
    },
    values: T[],
    sortValueOffset: number,
) => {
    const typeMap = new Map<U, T[]>()
    values.forEach(value => {
            const { type } = resolveTypes(value)
            // @ts-ignore
            safePushMap(typeMap, type, value)
        },
    )
    const newOrderingMap = new Map<T, number>()
    typeMap.forEach((rows, type) => {
        let previousValue: undefined | number
        rows.forEach(row => {
            // tslint:disable-next-line:no-shadowed-variable
            const { sortValue } = resolveTypes(row)
            if (previousValue === undefined) {
                previousValue = sortValue
            } else if ((previousValue + sortValueOffset) > sortValue) {
                previousValue = previousValue + sortValueOffset
            } else {
                previousValue = sortValue
            }
            newOrderingMap.set(row, previousValue)
        })
    })
    return newOrderingMap
}