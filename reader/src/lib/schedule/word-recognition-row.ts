import { SuperMemoGrade } from 'supermemo'
import { FlashCardType } from '../quiz/hidden-quiz-fields'

export interface WordRecognitionRow {
    id: number | string;
    word: string
    created_at: Date
    nextDueDate: Date

    interval: number
    repetition: number
    efactor: number
    grade: SuperMemoGrade

    flash_card_type: FlashCardType

    language_code: string
    creator_id: string | number;
}
