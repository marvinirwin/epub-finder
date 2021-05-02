import { SuperMemoGrade } from 'supermemo'

export interface WordRecognitionRow {
    id?: number
    word: string
    created_at: Date
    nextDueDate: Date

    interval: number
    repetition: number
    efactor: number
    grade: SuperMemoGrade

    flash_card_type: string

    language_code: string
}
