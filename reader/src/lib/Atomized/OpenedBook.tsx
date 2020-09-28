import React, {useEffect, useState} from 'react'
import {OpenBook} from "../BookFrame/OpenBook";
import {useObservableState} from "observable-hooks";
import {InnerHTMLIFrame} from "../../components/Frame/innerHTMLIFrame";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";
import {ds_Dict} from "../Util/DeltaScanner";
import {AtomizedSentence} from "./AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "./AtomizedDocument";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {safePush} from "../../test/Util/GetGraphJson";


export const OpenedBook: React.FunctionComponent<{openedBook: OpenBook}> = ({openedBook}) => {
    const bookStats = useObservableState<AtomizedDocumentStats>(openedBook.bookStats$)
    return <InnerHTMLIFrame bodyText={bookStats?.body || ''} headText={bookStats?.head || ''}
                            renderHandler={(head, body) =>
                                // @ts-ignore
        openedBook.handleHTMLHasBeenRendered(head, body)}
    />
}
export function rehydratePage(htmlDocument: HTMLDocument): ds_Dict<AtomizedSentence[]> {
    const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
    const annotatedElements: ds_Dict<AtomizedSentence[]> = {};
for (let i = 0; i < elements.length; i++) {
    const annotatedElement = elements[i];
    const sentenceElement = new AtomizedSentence(annotatedElement as unknown as XMLDocumentNode);
    safePush(annotatedElements, sentenceElement.translatableText, sentenceElement);
}
return annotatedElements;
}
