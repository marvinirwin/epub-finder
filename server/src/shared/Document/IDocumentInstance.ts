export interface IDocumentInstance {
    message: string;
    name: string;
    serialize: (() => void) | undefined
}