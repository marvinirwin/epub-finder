import { DocumentViewDto } from '@shared/'

export type TabulateRemoteDocumentDto = {
    notableSubsequences: string[]
    words: string[]
    d: DocumentViewDto
    language_code: string
}
