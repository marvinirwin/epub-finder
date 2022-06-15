import {IPositionedWord} from "./annotation/IPositionedWord";
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

export * from "./resolve-ext-from-reponse-headers";
export * from "./video-metadata.interface";
export * from "./video-character.interface";
export * from "./annotation/IPositionedWord";
export * from "./atom-metadata/atom-metadata";
export type { VideoMetadataDto } from "../video_metadata/video-metadata.dto";
export type { DocumentViewDto } from "../documents/document-view.dto";
export type { TranslateRequestDto } from "../translate/translate-request-dto";
export type { TransliterateRequestDto } from "../translate/transliterate-request.dto";
export type { TransliterateResponseDto } from "../translate/transliterate-response.dto";
export type { ImageObject } from "@azure/cognitiveservices-imagesearch/src/models/index";
