import React from "react";
import {LearningTree, TabulatedFrequencyDocument} from "../lib/learning-tree/learning-tree";
import {Typography} from "@material-ui/core";
import {FrequencyDocumentNodeArgs} from "../lib/frequency-tree.service";

export const FrequencyTreeNode: React.FC<FrequencyDocumentNodeArgs> =
    ({frequencyNode, parent, similarity}) => {
        const value = frequencyNode.value as TabulatedFrequencyDocument;
        return <div id={value.frequencyDocument.name}>
            <Typography>
                {value.frequencyDocument.name}
            </Typography>
            <Typography>
                {JSON.stringify(similarity, null, '\t')}
            </Typography>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                {Object.values(frequencyNode.children || {}).map(child =>
                    <FrequencyTreeNode
                        frequencyNode={child}
                        parent={frequencyNode}
                        similarity={LearningTree.memoizedSimilarityTabulation(
                            frequencyNode.value?.tabulation,
                            child.value?.tabulation
                        )}
                    />)}
            </div>
        </div>
    }