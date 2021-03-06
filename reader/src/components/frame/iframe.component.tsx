import React, {useEffect, useState} from 'react'
import { createPortal } from 'react-dom'
import {setMouseOverDivPosition, setMouseOverText} from "../mouseover-div";

export const IframeComponent = React.forwardRef<HTMLIFrameElement, {title: string} & React.HTMLProps<HTMLIFrameElement>>(({ children,title, ...props }, ref) => {
    const [contentRef, setContentRef] = useState<HTMLIFrameElement | null>()
    const head = contentRef?.contentWindow?.document.head;
    const body = contentRef?.contentWindow?.document.body;
    useEffect(() => {
        const contentWindow = contentRef?.contentWindow;
        if (contentWindow) {
            contentWindow.onmousemove = e => {
                const iframeClientRect = (contentRef as HTMLIFrameElement).getBoundingClientRect();
                const clientX = e.clientX + iframeClientRect.left;
                const clientY = e.clientY + iframeClientRect.top;
                setMouseOverDivPosition(
                    {
                        clientX,
                        clientY
                    }
                )
            }
        }
    }, [contentRef?.contentWindow])
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