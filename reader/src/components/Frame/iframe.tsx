import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export const Iframe: React.FunctionComponent<{title: string}> = ({ children,title, ...props }) => {
    const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>()
    const head = contentRef?.contentWindow?.document.head;
    const body = contentRef?.contentWindow?.document.body;
    // @ts-ignore
    const headChild = children[0];
    // @ts-ignore
    const bodyChild = children[1];
    return (
        <iframe title={title} style={{minHeight: '100%', maxHeight: '100%', width: '100%'}} {...props} ref={setContentRef} >
        {head && createPortal( headChild, head ) }
        {body && createPortal( bodyChild, body ) }
    </iframe>
)
}