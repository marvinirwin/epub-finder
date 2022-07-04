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

export * from "./tabulate-documents/set-with-unique-lengths";
export * from "./tabulation/word-separator";
export type {Named} from "./named.type";
export type {LeaderBoardDto} from "./leader-board.dto";
export * from "./supported-translation.service";
export * from "./supported-speech-to-text.service";
export type {ICard} from "./ICard";
export * from "./tabulation/word-count-records.module";
export type {DocumentWordCount} from "./DocumentWordCount";
export type {CreatedSentence} from "./CreatedSentence";
export * from "../entities/ignored-word-view.entity";
export * from "../entities/known-word-view.entity";
export * from "./supported-text-to-speech";
export type {SpeechSynthesisRequestDto} from "../speech/speech-synthesis-request-dto";
export * from "./XMLDocumentNode";
export type {AbstractSegment} from "./tabulate-documents/tabulate-segment/tabulate";
export type {PositionedWord, WordIdentifyingStrategy, SerializableTabulationConfiguration} from "./tabulation/tabulate";
export * from "./supported-transliteration.service";
export type {SimilarityResults} from "./compre-similarity-result";
export * from "./similarity-result.interface";
export * from "./ICard";
export type {CsvCard} from "./csv-card.interface";
export * from "./tabulation/serialized-tabulation.aggregate";
export type {IgnoredWord} from "../entities/ignored-word.entity";
export type {IgnoredWordView} from "../entities/ignored-word-view.entity";
export type {KnownWord} from "../entities/known-word.entity";
export type {UserSetting} from "../entities/user-setting.entity";