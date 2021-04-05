import React, { useContext } from 'react'
import { useObservableState } from 'observable-hooks'
import { InnerHtmlFrameComponent } from '../frame/inner-html-frame.component'
import { OpenDocument } from '../../lib/document-frame/open-document.entity'
import { ManagerContext } from '../../App'

export const OpenDocumentComponent = React.forwardRef<
    HTMLIFrameElement,
    { openedDocument: OpenDocument } & React.HTMLProps<HTMLIFrameElement>
>(({ openedDocument, ...props }, ref) => {
    const document = useObservableState(openedDocument.atomizedDocument$)
    const m = useContext(ManagerContext)
    return (
        <InnerHtmlFrameComponent
            {...props}
            title={openedDocument.label}
            bodyText={document?.bodyInnerHTML() || ''}
            headText={document?.headInnerHTML() || ''}
            renderHandler={(body) => {
                openedDocument.handleHTMLHasBeenRendered(body)
            }}
            ref={ref}
        />
    )
})
