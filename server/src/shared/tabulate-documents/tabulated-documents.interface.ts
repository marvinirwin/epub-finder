import { Dictionary } from 'lodash'
import { AtomMetadata } from '../atom-metadata.interface.ts/atom-metadata'
import { Segment } from './segment/segment'
import { DocumentWordCount } from '../DocumentWordCount'
import { XMLDocumentNode } from '../XMLDocumentNode'
import { SerializedSegment, WordCountRecord } from '../tabulation/tabulate'
import { IPositionedWord } from '../Annotation/IPositionedWord'

export type DocumentWordCounts = {
    id: string
    label: string
}

export type TabulatedDocuments = TabulatedSegments & DocumentWordCounts

export type TabulatedSegments = SerializedTabulation & {
    wordElementsMap: Dictionary<AtomMetadata[]>
    wordSegmentMap: Dictionary<Segment[]>
    segments: Segment[]
    atomMetadatas: Map<XMLDocumentNode, AtomMetadata>
}

export interface SerializedTabulation {
    notableSubSequences: IPositionedWord[],
    wordSegmentStringsMap: Map<string, Set<string>>
    segmentWordCountRecordsMap: Map<SerializedSegment, WordCountRecord[]>
}

export type SerializedDocumentTabulation = SerializedTabulation &
    DocumentWordCounts

