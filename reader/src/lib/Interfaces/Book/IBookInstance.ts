export interface IBookInstance {
    message: string;
    name: string;
    serialize: (() => void) | undefined
}