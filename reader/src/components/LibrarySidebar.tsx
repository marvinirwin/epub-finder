import React from 'react';
import {Manager} from "../lib/Manager";
import {useObservableState} from "observable-hooks";
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            width: '100%',
            maxWidth: 360,
            backgroundColor: theme.palette.background.paper,
        },
    }),
);

export const LibrarySidebar: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const library = useObservableState(m.openedBooks.library$);
    const classes = useStyles();

    return <div className={`library ${classes.root}`}>
        <List dense={true} component="nav" aria-label="main mailbox folders">
            {
                Object.values(library || {}).map(libraryBook => {
                    return <ListItem key={libraryBook.name} className={'library-book'}>
                        <ListItemText primary={libraryBook.name}
                                      onClick={() => m.openedBooks.readingBook$.next(libraryBook)}/>
                    </ListItem>;
                })
            }
        </List>
    </div>
}