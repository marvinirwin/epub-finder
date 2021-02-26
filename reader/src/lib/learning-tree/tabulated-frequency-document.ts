import {LtDocument, SerializedTabulation} from "@shared/";

export class TabulatedFrequencyDocument {
    constructor(
        public frequencyDocument: LtDocument,
        public tabulation: SerializedTabulation
    ) {
    }
}