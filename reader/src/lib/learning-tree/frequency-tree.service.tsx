import { combineLatest, Observable } from 'rxjs'
import { ds_Tree } from '../../services/tree.service'
import React from 'react'
import { SimilarityResults } from "@shared/"
import { SettingsService } from '../../services/settings.service'
import { FrequencyDocumentsRepository } from '../documents/frequency-documents.repository'
import { map } from 'rxjs/operators'
import { FrequencyTree } from './frequency-tree'
import { TabulatedFrequencyDocument } from './tabulated-frequency-document'
import { VocabService } from '../language/vocab.service'

export type FrequencyDocumentNodeArgs = {
    frequencyNode: ds_Tree<TabulatedFrequencyDocument>
    similarity: SimilarityResults | undefined
}

export class FrequencyTreeService {
    tree$: Observable<ds_Tree<TabulatedFrequencyDocument> | undefined>

    constructor({
        settingsService,
        frequencyDocumentsRepository,
        vocabService,
    }: {
        settingsService: SettingsService
        frequencyDocumentsRepository: FrequencyDocumentsRepository
        vocabService: VocabService
    }) {
        /*
                const similarity = memoize((f1: SerializedTabulation, f2: SerializedTabulation) => computeSimilarityTabulation(f1, f2));
        */
        this.tree$ = combineLatest([
            frequencyDocumentsRepository.selectedTabulated$,
            settingsService.progressTreeRootId$.obs$,
        ]).pipe(
            map(([allFrequencyDocuments, rootId]) => {
                const rootNode =
                    allFrequencyDocuments.find(
                        (d) => d.frequencyDocument.id() === rootId,
                    ) || allFrequencyDocuments[0]
                if (!rootNode) return
                return new FrequencyTree(allFrequencyDocuments, rootNode, {
                    notableSubSequences: [],
                    segmentWordCountRecordsMap: new Map(),
                    wordSegmentSubSequencesMap: new Map()
                })
                    .tree
                // For each frequency doc calculate its distance to the others, oh this is n^2, I'll memo it
            }),
        )
    }
}
