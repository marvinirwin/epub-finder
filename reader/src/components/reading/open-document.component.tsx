import React, { useContext, useEffect } from 'react'
import { useObservableState } from 'observable-hooks'
import { InnerHtmlFrameComponent } from '../frame/inner-html-frame.component'
import { OpenDocument } from '../../lib/document-frame/open-document.entity'
import { setMouseOverText } from '../mouseover-div/mouseover-div'

export const OpenDocumentComponent = React.forwardRef<
    HTMLIFrameElement,
    { openedDocument: OpenDocument } & React.HTMLProps<HTMLIFrameElement>
>(({ openedDocument, ...props }, ref) => {
    const document = useObservableState(openedDocument.atomizedDocument$)
    const bodyInnerHTML = document?.bodyInnerHTML()
    useEffect(() => {
        setTimeout(() => {
            setMouseOverText('', '');
        }, 10)
    }, [bodyInnerHTML])
    return (
        <InnerHtmlFrameComponent
            {...props}
            title={openedDocument.label}
            bodyText={bodyInnerHTML || ''}
            headText={document?.headInnerHTML() || ''}
            renderHandler={(body) => {
                openedDocument.handleHTMLHasBeenRendered(body)
            }}
            style={{alignSelf: 'flex-start', paddingLeft: '24px', paddingRight: '24px', paddingTop: '24px', paddingBottom: '128px'}}
            ref={ref}
        />
    )
})
