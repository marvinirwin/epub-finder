import React, {Fragment, useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {FormControlLabel, ListItem, MenuItem, Select, Switch} from "@material-ui/core";
import {LtDocument} from "@shared/*";

export const SetVocab = () => {
    const m = useContext(ManagerContext);
    const selectedVocab = useObservableState(m.settingsService.selectedVocabulary$) || "USE_QUIZ_RESULTS";
    const allDocuments: Map<string, LtDocument> = useObservableState(m.documentRepository.collection$) || new Map();
    return <ListItem>
        <FormControlLabel
            control={
                <Select
                    labelId="reading-language-select-label"
                    value={selectedVocab}
                    onChange={e => m.settingsService.selectedVocabulary$.next(
                        e.target.value as string
                    )}
                    style={{margin: '24px'}}
                >
                    <MenuItem value={'USE_QUIZ_RESULTS'}>
                        Use your quiz vocabulary
                    </MenuItem>
                    {
                        [...allDocuments.values()]
                            .map(c => <MenuItem
                                    key={c.id()}
                                    value={c.id()}>{c.name}
                                </MenuItem>
                            )
                    }
                </Select>
            }
            label="Use known vocabulary for tree"/>
    </ListItem>
}
