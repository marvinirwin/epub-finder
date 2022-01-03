import {IPositionedWord} from "./Annotation/IPositionedWord";
import {DocumentId} from "./sourced-text";

export { InterpolateService } from "./interpolate.service";
export { LtDocument } from "./lt-document";
export * from "./selectors";
export * from "./components";
export * from "./tabulate-documents/segment/segment";
export * from "./tabulate-documents/atomized-document";
export * from "./tabulate-documents/compute-element-index-map";
export * from "./tabulate-documents/tabulated-documents.interface";
export * from "./IImageRequest";
export * from "./safe-push";
export { tabulate } from "./tabulate-documents/tabulate-segment/tabulate";
export * from "./built-in-words/parse-cedict";
export * from "./annotation/IPositionedWord";

export * from "./serialize-card-for-csv";
export interface SegmentSubsequences {
    segmentText: string;
    subsequences: IPositionedWord[];
}

export interface AtomizedDocumentFromUrlParams {
    url: string;
    documentId: string;
}
export interface AtomizeSrcDocParams {
    documentId: DocumentId;
    documentSrc: string;
}
