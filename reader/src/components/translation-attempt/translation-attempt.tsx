import React, {useContext, useState, Fragment} from "react";
import {ManagerContext} from "../../App";
import {Button, Paper, TextField, Typography} from "@material-ui/core";
import {useObservableState} from "observable-hooks";

const translateRequest = '';

export const TranslationAttempt: React.FC = () => {
    const m = useContext(ManagerContext);
    const allScheduleRows = Object.values(useObservableState(m.translationAttemptScheduleService.indexedScheduleRows$) || {});
    // TODO maybe filter by due date
    const firstRow = allScheduleRows[0];
    const [translateAttempt, setTranslateAttempt] = useState<string>('');
    return <Paper>
        {
            firstRow &&
            <Fragment>
                <Typography>
                    {firstRow.d.segmentText}
                </Typography>
                <TextField
                    label="Translate"
                    inputProps={{id: translateRequest}}
                    multiline
                    rows={3}
                    variant="filled"
                    value={translateAttempt}
                    onChange={e => setTranslateAttempt(e.target.value)}
                />
                <Button
                    onClick={() => {
                        // TODO also clear translation attempt
                        m.translationAttemptRepository.addRecords$.next([
                            {
                                ...firstRow.d.segmentText
                            }
                        ])
                    }
                    }
                >Submit</Button>
            </Fragment>
        }
    </Paper>
}