import { DocumentViewDto } from 'languagetrainer-server/src/shared'

export type TabulateRemoteDocumentDto = {
    notableSubsequences: string[]
    words: string[]
    d: DocumentViewDto
    language_code: string
}
