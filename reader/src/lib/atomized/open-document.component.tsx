import React, {useEffect, useState} from 'react'
import {useObservableState} from "observable-hooks";
import {InnerHTMLIFrame} from "../../components/frame/innerHTMLIFrame";
import {Segment} from "../../../../server/src/shared/tabulate-documents/segment";
import {XMLDocumentNode} from "../interfaces/XMLDocumentNode";
import {OpenDocument} from "../document-frame/open-document.entity";
import { annotatedAndTranslated } from '@shared/';


export const OpenDocumentComponent =
    React.forwardRef<HTMLIFrameElement,
        { openedDocument: OpenDocument } & React.HTMLProps<HTMLIFrameElement>>(({openedDocument, ...props}, ref) => {
        const document = useObservableState(openedDocument.atomizedDocument$)
        return <InnerHTMLIFrame
            {...props}
            title={openedDocument.label}
            bodyText={document?.bodyInnerHTML() || ''}
            headText={document?.headInnerHTML() || ''}
            renderHandler={(head, body) => {
                // @ts-ignore
                openedDocument.handleHTMLHasBeenRendered(head, body);
            }}
            ref={ref}
        />
    })

export function rehydratePage(htmlDocument: HTMLDocument): Segment[] {
    return [...htmlDocument.getElementsByClassName(annotatedAndTranslated)]
        .map(element => new Segment(element as unknown as XMLDocumentNode))
}
