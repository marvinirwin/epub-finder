import {combineLatest, Observable} from "rxjs";
import {ds_Tree} from "../services/tree.service";
import {SerializedTabulation} from "@shared/*";
import React from "react";
import {SimilarityResults} from "../../../server/src/shared/compre-similarity-result";
import {SettingsService} from "../services/settings.service";
import {FrequencyDocumentsRepository} from "./frequency-documents.repository";
import {map} from "rxjs/operators";
import {memoize} from 'lodash';
import {computeSimilarityTabulation} from "../../../server/src/shared/similarity-result.interface";
import {LearningTree, TabulatedFrequencyDocument} from "./learning-tree/learning-tree";


export type FrequencyDocumentNodeArgs = {
    frequencyNode: ds_Tree<TabulatedFrequencyDocument>,
    similarity: SimilarityResults
};

export class FrequencyTreeService {
    tree$: Observable<ds_Tree<TabulatedFrequencyDocument> | undefined>;

    constructor(
        {
            settingsService,
            frequencyDocumentsRepository
        }:
            {
                settingsService: SettingsService,
                frequencyDocumentsRepository: FrequencyDocumentsRepository
            }
    ) {
/*
        const similarity = memoize((f1: SerializedTabulation, f2: SerializedTabulation) => computeSimilarityTabulation(f1, f2));
*/
        this.tree$ = combineLatest(
            [
                frequencyDocumentsRepository.allTabulated$,
                settingsService.progressTreeRootId$
            ]
        ).pipe(map(([allFrequencyDocuments, rootId]) => {
            const rootNode = allFrequencyDocuments
                    .find(d => d.frequencyDocument.id() === rootId) ||
                allFrequencyDocuments[0];
            if (!rootNode) return;
            return new LearningTree(
                allFrequencyDocuments,
                rootNode
            ).tree
            // For each frequency doc calculate its distance to the others, oh this is n^2, I'll memo it
        }))
    }
}