import {AppSingleton} from "../AppSingleton";
import {useObs} from "../UseObs";
import {RenderingBook} from "../lib/RenderingBook";
import React, {Fragment} from "react";
import {Dictionary} from "lodash";
import LeftBar from "./LeftBar";
import {makeStyles} from "@material-ui/core/styles";
import {BookContainer} from "./BookContainer";
import {BottomNav} from "./BottomNav";
import {PopupElements} from "./PopupElements";
import {Manager, NavigationPages} from "../lib/Manager";
import {Fab} from "@material-ui/core";
import AddIcon from '@material-ui/icons/Add';

window.addEventListener("dragover", function (e) {
    e.preventDefault();
}, false);
window.addEventListener("drop", function (e) {
    e.preventDefault();
}, false);

const useStyles = makeStyles((theme) => ({
    root: {
        flexFlow: 'column nowrap',
        '& > *': {
            borderRadius: 0
        },
        height: '100vh',
        width: '100vw',
        display: 'flex'
    },
    middle: {
        flexGrow: 1
    }
}));

function QuizPage({m}: { m: Manager }) {
    const nextItem = useObs(m.nextQuizItem$);
    return <div >
        TODO IMPLEMENT
    </div>
}

function TrendsPage({m}: { m: Manager }) {
    const trends = useObs(m.allTrends$);
    // Put all the trends in a select?
    // One half will be trends the other half will be tweets from that trend
    return <div style={{display: 'grid', gridTemplateColumns: '50% 50%'}}>
        <div>

        </div>
        <div style={{maxHeight: '90vh', minHeight: '90vh', overflow: 'auto'}}>

        </div>
    </div>
}

function ReadingPage({m}: { m: Manager }) {
    const books = useObs<Dictionary<RenderingBook>>(m.bookDict$);
    return <div style={{display: 'grid', gridTemplateColumns: '50% 50%'}}>
        <LeftBar m={m}/>
        <div style={{maxHeight: '90vh', minHeight: '90vh', overflow: 'auto'}}>
            <Fab style={{position: 'absolute'}} color="secondary" aria-label="add">
                <AddIcon />
            </Fab>
            {Object.values(books || {}).map(b => <BookContainer m={m} key={b.name} rb={b}/>)}
        </div>
    </div>
}

function resolveCurrentComponent(item: NavigationPages | undefined, m: Manager) {
    switch (item) {
        case NavigationPages.QUIZ_PAGE:
            return <QuizPage m={m}/>
        case NavigationPages.TRENDS_PAGE:
            return <TrendsPage m={m}/>
        case NavigationPages.READING_PAGE:
            return <ReadingPage m={m}/>
        default:
            return <ReadingPage m={m}/>
    }
}

export function Main({s}: { s: AppSingleton }) {
    const {m} = s;
    const classes = useStyles();
    const item = useObs(m.bottomNavigationValue$);
    const SelectedPage = resolveCurrentComponent(item, m);

    return <div>
        <PopupElements m={m}/>
        <div style={{maxHeight: '90vh', minHeight: '90vh', overflow: 'auto'}}>
            {SelectedPage}
        </div>
        <BottomNav m={m}/>
    </div>;
}