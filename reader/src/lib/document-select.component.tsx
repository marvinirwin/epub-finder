import React, {useContext} from "react";
import {List, ListItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {LtDocument} from "@shared/*";

export const DocumentSelect = () => {
    const m = useContext(ManagerContext);
    const books = useObservableState(m.documentRepository.collection$);
    return <List>
        {[...books?.values()].map((document: LtDocument) => (
            <ListItem button
                      onClick={() => {
                          m.settingsService.readingDocument$.next(document.name)
                      }}
                      key={document.id()}
            >
                {/*
                <ListItemAvatar>
                    <Avatar className={classes.avatar}>
                        <PersonIcon/>
                    </Avatar>
                </ListItemAvatar>
*/}
                <ListItemText primary={document.name}/>
            </ListItem>
        ))}
    </List>
}