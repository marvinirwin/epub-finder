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
                ]
            case FlashCardType.LearningLanguageAudio:
                return [
                    QuizCardField.KnownLanguageDefinition,
                    QuizCardField.Description,
                    QuizCardField.Romanization,
                    QuizCardField.Picture,
                    QuizCardField.ExampleSegments,
                ]
        }
    }
    return new Set(resolveHiddenFields())
}
