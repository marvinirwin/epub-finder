import { LtDocument, SerializedTabulation } from 'languagetrainer-server/src/shared'

export class TabulatedFrequencyDocument {
    constructor(
        public frequencyDocument: LtDocument,
        public tabulation: SerializedTabulation,
    ) {}
}
