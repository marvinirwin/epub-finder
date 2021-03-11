import {SerializedTabulation} from "@shared/";
import {orderBy, sum} from "lodash";
import {computeSimilarityTabulation} from "../../../../server/src/shared/similarity-result.interface";
import {ds_Tree} from "../../services/tree.service";
import memoize from 'memoizee';
import {TabulatedFrequencyDocument} from "./tabulated-frequency-document";


export class FrequencyTree {
    public static memoizedSimilarityTabulation = memoize((
        t1: SerializedTabulation,
        t2: SerializedTabulation,
        vocab: SerializedTabulation
    ) => {
        return computeSimilarityTabulation(
            {
                wordCounts: {
                    ...t1.wordCounts,
                    ...vocab.wordCounts,
                },
                wordSegmentStringsMap: new Map(),
                greedyWordCounts: new Map(
                    [
                        ...t1.greedyWordCounts.entries(),
                        ...vocab.greedyWordCounts.entries()
                    ]
                )
            },
            t2
        );
    })
    public tree: ds_Tree<TabulatedFrequencyDocument>;
    private availableSet: Set<TabulatedFrequencyDocument>;

    constructor(
        public tabulatedFrequencyDocuments: TabulatedFrequencyDocument[],
        public root: TabulatedFrequencyDocument,
        public knownWords: SerializedTabulation,
    ) {
        const pushNodeToStack = (f: TabulatedFrequencyDocument): ds_Tree<TabulatedFrequencyDocument> => ({
            value: f,
            children: {},
            nodeLabel: f.frequencyDocument.name,
        })
        const stack: ds_Tree<TabulatedFrequencyDocument>[] = [pushNodeToStack(root)];
        const rootTree = stack[0];
        this.availableSet = new Set(tabulatedFrequencyDocuments);
        this.availableSet.delete(root);
        let currentNode: ds_Tree<TabulatedFrequencyDocument> | undefined;
        // tslint:disable-next-line:no-conditional-assignment
        while (currentNode = stack.shift()) {
            const neighbors = this.getNClosestNeighbors(root, 3).map(pushNodeToStack)
            currentNode.children = Object.fromEntries(neighbors.map(neighbor => [neighbor.nodeLabel, neighbor]))
            neighbors.forEach(neighbor => this.availableSet.delete(neighbor.value as TabulatedFrequencyDocument))
            stack.push(...neighbors);
        }
        this.tree = rootTree;
    }

    private getNClosestNeighbors(root: TabulatedFrequencyDocument, n: number = 3) {
        const frequencyDocumentTabulationDistance = (tabulation: SerializedTabulation, tabulation2: SerializedTabulation) => {
            const difference = FrequencyTree.memoizedSimilarityTabulation(
                tabulation,
                tabulation2,
                this.knownWords
            );
            const knownWordsSum = sum(Object.values(difference.knownWords));
            const unknownWordsSum = sum(Object.values(difference.unknownWords));
            return unknownWordsSum / (unknownWordsSum + knownWordsSum);
        };

        return orderBy(
            [...this.availableSet.values()],
            potentialChild => frequencyDocumentTabulationDistance(root.tabulation, potentialChild.tabulation)
        ).slice(0, n);
    }
}

