export interface ITrendLocation {
    country: string,
    countryCode: string,
    name: string,
    parentid: number,
    placeType: {
        code: number,
        name: string
    },
    url: string,
    woeid: number
}