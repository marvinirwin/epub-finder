export interface ImageSearchRequest {
    term: string;
    cb: (s: string) => void
}