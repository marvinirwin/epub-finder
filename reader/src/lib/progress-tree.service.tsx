import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {ds_Tree} from "../services/tree.service";
import {LtDocument, SerializedTabulation} from "@shared/*";
import React from "react";
import {Typography} from "@material-ui/core";
import {SimilarityResults} from "../../../server/src/shared/compre-similarity-result";
import {SettingsService} from "../services/settings.service";
import {FrequencyDocumentsRepository} from "./frequency-documents.repository";
import {map} from "rxjs/operators";
import {FrequencyDocument} from "./frequency-documents";
import {memoize} from 'lodash';
import {computeSimilarityTabulation} from "../../../server/src/shared/similarity-result.interface";
import {LearningTree, TabulatedFrequencyDocument} from "./learning-tree/learning-tree";


type FrequencyDocumentNodeArgs = {
    node: FrequencyDocumentTreeNode,
    parent: FrequencyDocumentTreeNode,
    similarity: SimilarityResults
};
export const FrequencyDocumentTreeNodeComponent: React.FC<FrequencyDocumentNodeArgs> = ({node, parent, similarity}) => {
    return <div id={node.frequencyDoc.name}>
        <Typography>
            {node.frequencyDoc.name}
        </Typography>
        <Typography>
            {JSON.stringify(similarity, null, '\t')}
        </Typography>
    </div>
}

export class FrequencyDocumentTreeNode {
    constructor(
        public frequencyDoc: LtDocument,
        public tabulation: SerializedTabulation
    ) {
    }
}

export class ProgressTreeService {
    tree$: Observable<ds_Tree<FrequencyDocumentTreeNode> | undefined>;

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
        const similarity = memoize((f1: SerializedTabulation, f2: SerializedTabulation) => computeSimilarityTabulation(f1, f2) );
        this.tree$ = combineLatest(
            [
                frequencyDocumentsRepository.all$,
                settingsService.progressTreeRootId$
            ]
        ).pipe(map(( [allFrequencyDocuments, rootId] ) => {
            const rootNode = allFrequencyDocuments.get(rootId) || allFrequencyDocuments.values().next();
            if (!rootNode) return;
            return new LearningTree(
                allFrequencyDocuments.values().next(),
                rootNode
            )
            // For each frequency doc calculate its distance to the others, oh this is n^2, I'll memo it
        }))
    }
}