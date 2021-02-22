import React from "react";
import {LearningTree, TabulatedFrequencyDocument} from "../lib/learning-tree/learning-tree";
import {Typography} from "@material-ui/core";
import {FrequencyDocumentNodeArgs} from "../lib/frequency-tree.service";
import { sum } from "lodash";

export const FrequencyTreeNode: React.FC<FrequencyDocumentNodeArgs> =
    ({frequencyNode,  similarity}) => {
        const value = frequencyNode.value as TabulatedFrequencyDocument;
        return <div id={value.frequencyDocument.name}>
            <Typography>
                {value.frequencyDocument.name}
            </Typography>
            <Typography>
{/*
                {JSON.stringify(similarity.unknownWords, null, '\t')}
*/}
                {
                    sum(Object.values(similarity.unknownWords))
                }
            </Typography>
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '24px'}}>
                {Object.values(frequencyNode.children || {}).map(child =>
                    <FrequencyTreeNode
                        frequencyNode={child}
                        similarity={LearningTree.memoizedSimilarityTabulation(
                            frequencyNode.value?.tabulation,
                            child.value?.tabulation
                        )}
                    />)}
            </div>
        </div>
    }