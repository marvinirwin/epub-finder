import {BottomNavigation, BottomNavigationAction} from "@material-ui/core";
import React from "react";
import {Manager, NavigationPages} from "../lib/Manager/Manager";
import {useObs} from "../UseObs";

import ChromeReaderMode from '@material-ui/icons/ChromeReaderMode';
import School from '@material-ui/icons/School';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    bottomNav: {
        maxHeight: '10vh',
        minHeight: '10vh'
    }
}));

export function BottomNav({m}: { m: Manager }) {
    const item = useObs(m.bottomNavigationValue$)
    const classes = useStyles();
    return <BottomNavigation className={classes.bottomNav}
        value={item}
        onChange={(_, v) => m.bottomNavigationValue$.next(v)}
    >
        <BottomNavigationAction label="Read" value={NavigationPages.READING_PAGE} icon={<ChromeReaderMode/>}/>
        <BottomNavigationAction label="Find Material" value={NavigationPages.TRENDS_PAGE} icon={<LibraryBooks/>}/>
        <BottomNavigationAction label="Quiz" value={NavigationPages.QUIZ_PAGE} icon={<School/>}/>
    </BottomNavigation>;
}