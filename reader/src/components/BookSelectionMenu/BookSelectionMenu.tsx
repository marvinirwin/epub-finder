import React from 'react';
import {Manager} from "../../lib/Manager";
import {useObservableState} from "observable-hooks";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Paper} from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

export const BookSelectionMenu: React.FunctionComponent<{ m: Manager }> = ({m}) => {
/*
    const library = useObservableState(m.library.);
*/
    const classes = useStyles();

    return <Paper className={`library ${classes.root}`} elevation={3}>
{/*
        <List dense={true} component="nav">
            {
                Object.values(library || {}).map(libraryBook => {
                    return <ListItem
                        key={libraryBook.name}
                        className={'library-book'}
                        button>
                        <ListItemText primary={libraryBook.name}
                                      onClick={() => m.openedBooks.readingBook$.next(libraryBook)}/>
                    </ListItem>;
                })
            }
        </List>
*/}
    </Paper>
}