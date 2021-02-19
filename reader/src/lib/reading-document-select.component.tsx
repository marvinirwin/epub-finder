import React, {useContext} from "react";
import {List, ListItem, ListItemAvatar, ListItemText} from "@material-ui/core";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {documentSelectionRow, frequencyDocumentSelectRow, LtDocument} from "@shared/";
import {FrequencyDocument} from "./frequency-documents";

const ReadingDocumentList = () => {
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
    </List>;
};

function FrequencyDocumentList() {
    const m = useContext(ManagerContext);
    const books = useObservableState(m.frequencyDocumentsRepository.all$);
    const selectedDocuments = useObservableState(m.settingsService.selectedFrequencyDocuments$) || [];
    return <List>
        {[...(books?.values() || [])].map((document: FrequencyDocument) => {
            const documentId = document.frequencyDocument.id();
            const documentSelected = selectedDocuments.includes(documentId);
            return (
                <ListItem
                    button
                    id={document.frequencyDocument.name}
                    selected={documentSelected}
                    className={frequencyDocumentSelectRow}
                    onClick={() => {
                        const unSelectFrequencyDocument = () => {
                            m.settingsService.selectedFrequencyDocuments$.next(
                                selectedDocuments.filter(d => d !== documentId)
                            )
                        };

                        const unselectFrequencyDocument = () => {
                            m.settingsService.selectedFrequencyDocuments$.next(
                                selectedDocuments.concat(documentId)
                            )
                        };

                        if (documentSelected) {
                            unSelectFrequencyDocument();
                        } else {
                            unselectFrequencyDocument();
                        }
                    }}
                    key={document.frequencyDocument.id()}
                >
                    <ListItemText primary={document.frequencyDocument.name}/>
                </ListItem>
            );
        })}
    </List>;
}

export const DocumentSelect = () => {
    const m = useContext(ManagerContext);
    return <div style={{display: 'flex'}}>
        <ReadingDocumentList/>
        <FrequencyDocumentList/>
    </div>
}