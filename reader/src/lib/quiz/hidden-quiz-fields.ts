export type HiddenQuizFields = Set<keyof QuizCardField>
export enum FlashCardType {
    WordExamplesAndPicture = 'WordAndExamples',
    KnownLanguage = 'KnownLanguage',
    LearningLanguageAudio = 'LearningLanguageAudio'
}


export enum QuizCardField {
    KnownLanguageDefinition = 'KnownLanguageDefinition',
    Description = 'Description',
    Picture = 'Picture',
    Sound = 'Sound',
    Romanization = 'Romanization',
    LearningLanguage = 'LearningLanguage',
    ExampleSegments = 'ExampleSegments',
}

/**
 * TODO, I'll have to put something where which makes it skip hidden fields if audio/translation/etc is not supported for the current language
 */
export const resolveHiddenFieldsForFlashcardType = (t: FlashCardType): Set<QuizCardField> => {
    function resolveHiddenFields() {
        switch (t) {
            case FlashCardType.WordExamplesAndPicture:
                return [
                    QuizCardField.KnownLanguageDefinition,
                    QuizCardField.Description,
                    QuizCardField.Romanization,
                ]
            case FlashCardType.KnownLanguage:
                return [
                    QuizCardField.Description,
                    QuizCardField.Romanization,
                    QuizCardField.Picture,
                    QuizCardField.Sound,
                    QuizCardField.ExampleSegments,
                    QuizCardField.LearningLanguage
                ]
            case FlashCardType.LearningLanguageAudio:
                return [
                    QuizCardField.KnownLanguageDefinition,
                    QuizCardField.Description,
                    QuizCardField.Romanization,
                    QuizCardField.ExampleSegments,
                    QuizCardField.LearningLanguage
                ]
        }
    }
    return new Set(resolveHiddenFields())
}
