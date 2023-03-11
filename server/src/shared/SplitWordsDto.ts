export interface SplitWordsDto {
    language_code: string;
    text: string;
}
export interface SplitWordsResponse {
    splitWords: {word: string,  position: number}[]
}