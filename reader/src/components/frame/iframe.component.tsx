import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export const IframeComponent = React.forwardRef<HTMLIFrameElement, {title: string} & React.HTMLProps<HTMLIFrameElement>>(({ children,title, ...props }, ref) => {
    const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>()
    const head = contentRef?.contentWindow?.document.head;
    const body = contentRef?.contentWindow?.document.body;
    // @ts-ignore
    const headChild = children[0];
    // @ts-ignore
    const bodyChild = children[1];
    return (
        <iframe title={title}  {...props} ref={el => {
            setContentRef(el);
            if (typeof ref === 'function') {
                ref(el)
            } else if (ref) {
                ref.current = el;
            }
        }} >
        {head && createPortal( headChild, head ) }
        {body && createPortal( bodyChild, body ) }
    </iframe>
)
})