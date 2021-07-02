import React, {useContext} from "react";
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {Box, Button} from "@material-ui/core";
import {saveAs} from "file-saver";

export const CsvComponent = () => {
    const m = useContext(ManagerContext)
    const csvs = useObservableState(m.csvService.csvAndZip$)
    const tag = Math.random()
    return <Box p={1} m={2} style={{whiteSpace: 'pre', height: '90vh', width: '90vw'}}>
        <Button onClick={() => {
            if (csvs) {
                csvs.zip.generateAsync({type: 'blob'}).then(blob => saveAs(blob, 'anki-media.zip'))
            }
        }}>
            Download Zip
        </Button>
        <div>
            {csvs?.csvRows?.map(v => `"${[v.learning_language, v.description, v.photo, v.sound, v.romanization, tag]
                .map(str => `${str}`.replace(`"`, `&ldquo`)).join('","')}"`).join('\n')}
        </div>
    </Box>
};