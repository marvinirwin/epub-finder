import React, {useContext} from "react";
import {FrequencyTree} from "../lib/learning-tree/frequency-tree";
import {Card, Paper, Typography, Button} from "@material-ui/core";
import {FrequencyDocumentNodeArgs} from "../lib/frequency-tree.service";
import {TabulatedFrequencyDocument} from "../lib/learning-tree/tabulated-frequency-document";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {SerializedTabulation} from "@shared/";

export const FrequencyTreeNode: React.FC<FrequencyDocumentNodeArgs> =
    ({frequencyNode, similarity}) => {
        const value = frequencyNode.value as TabulatedFrequencyDocument;
        const m = useContext(ManagerContext);
        const vocab = useObservableState(m.vocabService.vocab$) || {
            wordCounts: {},
            wordSegmentStringsMap: new Map(),
            greedyWordCounts: new Map()
        };
        return <Paper
            id={value.frequencyDocument.name}
            style={{margin: '24px'}}
        >
            <Button style={{margin: '24px'}}
                    onClick={() => m.settingsService.progressTreeRootId$.next(value.frequencyDocument.id())}
            >
                {value.frequencyDocument.name}
            </Button>
            <div style={{margin: '24px', display: 'flex', flexFlow: 'row wrap'}}>
                {Object.entries(similarity?.unknownWords || {}).map(([word, count]) => <span
                    style={{margin: '8px'}}
                    key={word}>{word}: {count}
                </span>)}
                {/*
                {similarity && JSON.stringify(similarity.unknownWords, null, '\t')}
*/}
                {/*
                {
                    sum(Object.values(similarity.unknownWords))
                }
*/}
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '24px'}}>
                {Object.values(frequencyNode.children || {}).map(child =>
                    <FrequencyTreeNode
                        key={Math.random()}
                        frequencyNode={child}
                        similarity={FrequencyTree.memoizedSimilarityTabulation(
                            frequencyNode.value?.tabulation as SerializedTabulation,
                            child.value?.tabulation as SerializedTabulation,
                            vocab
                        )}
                    />)}
            </div>
        </Paper>
    }