import React, {useEffect, useState} from 'react'
import {useObservableState} from "observable-hooks";
import {InnerHTMLIFrame} from "../../components/Frame/innerHTMLIFrame";
import {ds_Dict} from "../Tree/DeltaScanner";
import {Segment} from "./segment";
import {ANNOTATE_AND_TRANSLATE} from "./atomized-document";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {safePush} from "../../services/safe-push";
import {OpenDocument} from "../DocumentFrame/open-document.entity";


export const OpenDocumentComponent =
    React.forwardRef<HTMLIFrameElement,
        { openedDocument: OpenDocument } & React.HTMLProps<HTMLIFrameElement>>(({openedDocument, ...props}, ref) => {
        const document = useObservableState(openedDocument.atomizedDocument$)
        return <InnerHTMLIFrame
            {...props}
            title={openedDocument.name}
            bodyText={document?.bodyInnerHTML() || ''}
            headText={document?.headInnerHTML() || ''}
            renderHandler={(head, body) => {
                // @ts-ignore
                openedDocument.handleHTMLHasBeenRendered(head, body);
            }}
            ref={ref}
        />
    })

export function rehydratePage(htmlDocument: HTMLDocument): ds_Dict<Segment[]> {
    const elements = htmlDocument.getElementsByClassName(ANNOTATE_AND_TRANSLATE);
    const segments: ds_Dict<Segment[]> = {};
    for (let i = 0; i < elements.length; i++) {
        const annotatedElement = elements[i];
        const segmentElement = new Segment(annotatedElement as unknown as XMLDocumentNode);
        safePush(segments, segmentElement.translatableText, segmentElement);
    }
    return segments;
}
