import {useLocalStorage} from "beautiful-react-hooks";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary, Divider, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


const changes: { message: string, date: string }[] = [
    ['2021-07-01', `Added ChangeLog`],
    ['2021-07-01', `Removed safari support because I couldn't decode audio data, or autoplay :(`],
    ['2021-07-01', `Restore example sentences`],
    ['2021-07-01', `Added highlight debug elements in dev`],
    ['2021-07-01', `Added way to contact me`],
    ['2021-07-04', `Fixed blank quiz screen for new users with startWith`],
    ['2021-07-04', `Clarified addMore dialog`],
].map(([date, message]) => ({
    message,
    date,
})).reverse();
const [firstChange, ...otherChanges] = changes;

const ChangeLogEntry: React.FC<{ date: string, message: string }> = ({date, message}) => {
    return <>
        <Typography
            variant='caption'
            style={{
                color: 'grey',
                marginRight: '8px',
                minWidth: '9ch'
            }}
        >
            {date}
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
                    otherChanges.map((changeEntry) => <div style={{display: 'flex', flexFlow: ''}}>
                        <ChangeLogEntry {...changeEntry} />
                        <Divider/>
                    </div>)
                }
            </AccordionDetails>
        </Accordion>
    </div>
}