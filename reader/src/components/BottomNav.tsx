import {BottomNavigation, BottomNavigationAction} from "@material-ui/core";
import React from "react";
import {Manager, NavigationPages} from "../lib/Manager";
import {useObs} from "../lib/UseObs";

import ChromeReaderMode from '@material-ui/icons/ChromeReaderMode';
import School from '@material-ui/icons/School';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Settings from '@material-ui/icons/Settings';
import {makeStyles} from "@material-ui/core/styles";
import CircularProgress from '@material-ui/core/CircularProgress';


const useStyles = makeStyles((theme) => ({
    bottomNav: {
        maxHeight: '10vh',
        minHeight: '10vh'
    }
}));


export function BottomNav({m}: { m: Manager }) {
    const item = useObs(m.bottomNavigationValue$)
    const classes = useStyles();
    const loadingCards = useObs(m.cardManager.cardLoadingSignal$);
    const rendering = useObs(m.renderingInProgress$);
    return <BottomNavigation className={classes.bottomNav}
        value={item}
        onChange={(_, v) => m.bottomNavigationValue$.next(v)}
    >
        {loadingCards && <CircularProgress/>}
        {rendering && <CircularProgress color="secondary"/>}
        <BottomNavigationAction label="Read" value={NavigationPages.READING_PAGE} icon={<ChromeReaderMode/>}/>
        <BottomNavigationAction label="Word Frequency" value={NavigationPages.TRENDS_PAGE} icon={<LibraryBooks/>}/>
        <BottomNavigationAction label="Quiz" value={NavigationPages.QUIZ_PAGE} icon={<School/>}/>
        <BottomNavigationAction label="Settings" value={NavigationPages.SETTINGS_PAGE} icon={<Settings/>}/>
    </BottomNavigation>;
}