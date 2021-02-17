import React, {useContext} from "react";
import {List, ListItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {documentSelectionRow, LtDocument} from "@shared/";

export const DocumentSelect = () => {
    const m = useContext(ManagerContext);
    const books = useObservableState(m.documentRepository.collection$);
    return <List>
        {[...(books?.values() || [])].map((document: LtDocument) => (
            <ListItem button
                      className={documentSelectionRow}
                      onClick={() => {
                          m.settingsService.readingDocument$.next(document.id())
                      }}
                      key={document.id()}
            >
                <ListItemText primary={document.name}/>
            </ListItem>
        ))}
    </List>
}