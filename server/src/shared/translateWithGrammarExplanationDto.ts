export interface TranslateWithGrammarExplanationDto {
    sourceLanguageCode: string;
    text: string;
    destLanguageCode: string
}

export interface TranslateWithGrammarExplanationResponseDto {
    sourceText: string;
    translatedText: string;
    grammarHints: string[]
}
