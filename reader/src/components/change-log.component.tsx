import {useLocalStorage} from "beautiful-react-hooks";
import React from "react";
import {Accordion, AccordionDetails, AccordionSummary, Divider, Typography} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


const changes: { message: string, date: string }[] = [
    ['2021-07-1', `Removed safari support because I couldn't decode audio data, or autoplay :(`],
    ['2021-07-1', `Fixed the example sentence bug`],
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
                marginRight: '8px'
            }}
        >
            {date}
        </Typography>
        <Typography variant='body1'>
            {message}
        </Typography></>
}
export const ChangeLog = () => {
    const [showChangeLog, setShowChangeLog] = useLocalStorage('show-changelog', true);
    return <div style={{position: 'relative', alignSelf: 'start', maxWidth: '45ch', justifySelf: 'flex-end'}}>
        <Accordion
            style={{position: 'absolute', width: '100%'}}
            expanded={showChangeLog}
            onChange={(event, isExpanded) => setShowChangeLog(isExpanded)}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                style={{margin: 0}}
            >
                <ChangeLogEntry {...firstChange} />
            </AccordionSummary>
            <AccordionDetails>
                {
                    otherChanges.map((changeEntry) => <>
                        <ChangeLogEntry {...changeEntry} />
                        <Divider/>
                    </>)
                }
                <Typography>


                </Typography>
            </AccordionDetails>
        </Accordion>
    </div>
}