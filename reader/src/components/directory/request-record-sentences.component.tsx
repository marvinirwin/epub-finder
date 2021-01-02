import {ManagerContext} from "../../App";
import React, {useCallback, useContext} from "react";
import {useObservableState} from "observable-hooks";
import {Button, Checkbox, List, ListItem, ListItemIcon, ListItemText, Paper} from "@material-ui/core";


const RecordRequestSentence: React.FC<{
    sentence: string,
    alreadySubmitted: boolean,
    selected: boolean,
    onChange: (s: string) => void
}> = ({sentence, alreadySubmitted, selected, onChange}) => {
    return<ListItem key={sentence}>
        <ListItemIcon>
            <Checkbox
                edge="start"
                checked={selected}
                disabled={alreadySubmitted}
                onChange={() =>
                    onChange(sentence)
/*
                    currentMap &&
                    m.requestRecordingService
                        .recordRequestSentences$
                        .next(
                            new Map(currentMap.set(sentence, !selected))
                        )
*/
                }/>
        </ListItemIcon>
        <ListItemText>
            {sentence}
        </ListItemText>
    </ListItem>
}

export const RequestRecordingSentences = () => {
    const m = useContext(ManagerContext);
    const sentences = useObservableState(m.requestRecordingService.allRenderedSentences$) || [];
    const selectedSentenceMap = useObservableState(m.requestRecordingService.recordRequestSentences$);
    const alreadySubmittedSet = useObservableState(m.requestRecordingService.allRecordRequestsSubmitted);
    const toggleSentenceSelected = useCallback((sentence) => {
        m.requestRecordingService.recordRequestSentences$.next(
            selectedSentenceMap && new Map(selectedSentenceMap.set(sentence, !!selectedSentenceMap.get(sentence)))
        )
    }, [selectedSentenceMap]);
    return <Paper>
        <Button color="primary" onClick={() => {
            m.requestRecordingService.sendRecordingRequests();
        }}>
            Click to request pronunciation videos of selected sentences
        </Button>
        <List>
            {
                sentences.map(sentence =>
                    <RecordRequestSentence
                        sentence={sentence}
                        alreadySubmitted={!!alreadySubmittedSet?.has(sentence)}
                        selected={!!selectedSentenceMap?.get(sentence)}
                        onChange={toggleSentenceSelected}
                        key={sentence}
                    />
                )
            }
        </List>
    </Paper>
}