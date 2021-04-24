import { SuperMemoGrade } from 'supermemo'

export interface WordRecognitionRow {
    id?: number
    word: string
    timestamp: Date
    nextDueDate: Date

    interval: number
    repetition: number
    efactor: number
    grade: SuperMemoGrade

    flash_card_type: string

    language_code: string
}
