import {useLocalStorage} from "beautiful-react-hooks";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary, Divider, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import {format} from "date-fns";
import {changeLog} from "./change-log";
import {dateFormat} from "../lib/util/dateFormat";


const [firstChange, ...otherChanges] = changeLog;

const ChangeLogEntry: React.FC<{ date: Date, message: string }> = ({date, message}) => {
    return <>
        <Typography
            variant='caption'
            style={{
                color: 'grey',
                marginRight: '8px',
                minWidth: '20ch'
            }}
        >
            {format(date, dateFormat)}
        </Typography>
        <Typography variant='caption'>
            {message}
        </Typography></>
}
export const ChangeLog = () => {
    const [showChangeLog, setShowChangeLog] = useLocalStorage('show-changelog', true);
    return <div style={{position: 'relative', alignSelf: 'start', maxWidth: '65ch', justifySelf: 'flex-end', flex: 1}}>
        <Accordion
            style={{position: 'absolute', width: '100%', marginTop: '8px'}}
            expanded={showChangeLog}
            onChange={(event, isExpanded) => setShowChangeLog(isExpanded)}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                style={{margin: 0}}
            >
                <ChangeLogEntry {...firstChange} />
            </AccordionSummary>
            <AccordionDetails style={{display: 'flex', flexFlow: 'column nowrap', maxWidth: '90vh'}}>
                {
                    otherChanges.map((changeEntry) => <div key={changeEntry.message} style={{display: 'flex', flexFlow: ''}}>
                        <ChangeLogEntry {...changeEntry} />
                        <Divider/>
                    </div>)
                }
            </AccordionDetails>
        </Accordion>
    </div>
}