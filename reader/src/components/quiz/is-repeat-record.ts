export const isRepeatRecord = <T, U>(lastNItems: T[], nextItem: T, keyFunction: (v: T) => U) => {
    const us = lastNItems.map(keyFunction)
    const searchElement = keyFunction(nextItem)
    if (us.includes(searchElement)) {
        return true
    }
    return false
}