export interface SplitWordsDto {
    language_code: string;
    text: string;
}
export interface SplitWordsResponseDto {
    splitWords: {word: string,  position: number}[]
}