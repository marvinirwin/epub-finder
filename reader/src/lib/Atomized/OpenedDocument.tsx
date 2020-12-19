import React, {useEffect, useState} from 'react'
import {OpenDocument} from "../DocumentFrame/OpenDocument";
import {useObservableState} from "observable-hooks";
import {InnerHTMLIFrame} from "../../components/Frame/innerHTMLIFrame";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";
import {ds_Dict} from "../Tree/DeltaScanner";
import {AtomizedSentence} from "./AtomizedSentence";
import {ANNOTATE_AND_TRANSLATE} from "./ERROR_DOCUMENT";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {safePush} from "../../services/safe-push";


export const OpenedDocument =
    React.forwardRef<HTMLIFrameElement,
        { openedDocument: OpenDocument } & React.HTMLProps<HTMLIFrameElement>>(({openedDocument, ...props}, ref) => {
        const documentStats = useObservableState<AtomizedDocumentStats>(openedDocument.documentStats$)
        return <InnerHTMLIFrame
            {...props}
            title={openedDocument.name}
            bodyText={documentStats?.body || ''}
            headText={documentStats?.head || ''}
            renderHandler={(head, body) => {
                // @ts-ignore
                openedDocument.handleHTMLHasBeenRendered(head, body);
            }}
            ref={ref}
        />
    })

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
