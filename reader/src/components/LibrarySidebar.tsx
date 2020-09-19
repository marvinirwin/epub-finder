import React from "react";
import {Manager} from "../lib/Manager";
import {useObservableState} from "observable-hooks";
import {List, ListItem, ListItemText} from "@material-ui/core";

export const LibrarySidebar: React.FunctionComponent<{ m: Manager }> = ({m}) => {
    const library = useObservableState(m.openedBooks.library$);
    return <div className={'library'}>
        <List dense={true}>
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