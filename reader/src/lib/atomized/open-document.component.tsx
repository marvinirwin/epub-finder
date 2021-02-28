import React, {useEffect, useState} from 'react'
import {useObservableState} from "observable-hooks";
import {InnerHtmlFrameComponent} from "../../components/frame/inner-html-frame.component";
import {Segment} from "../../../../server/src/shared/tabulate-documents/segment";
import {XMLDocumentNode} from "../../../../server/src/shared/XMLDocumentNode";
import {OpenDocument} from "../document-frame/open-document.entity";
import { annotatedAndTranslated } from '@shared/';


export const OpenDocumentComponent =
    React.forwardRef<HTMLIFrameElement,
        { openedDocument: OpenDocument } & React.HTMLProps<HTMLIFrameElement>>(({openedDocument, ...props}, ref) => {
        const document = useObservableState(openedDocument.atomizedDocument$)
        return <InnerHtmlFrameComponent
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
