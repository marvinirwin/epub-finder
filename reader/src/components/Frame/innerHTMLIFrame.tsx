import React, {useEffect, useState, Fragment} from 'react'
import {Iframe} from './iframe'
import {BodyStyle} from "../../lib/DocumentFrame/AppendDocumentStyle";

export type IFrameRenderHandler = (head: HTMLTitleElement, body: HTMLDivElement) => void;

export const InnerHTMLIFrame = React.forwardRef<HTMLIFrameElement,
    {
        headText: string,
        bodyText: string,
        renderHandler: IFrameRenderHandler,
        title: string
    } & React.HTMLProps<HTMLIFrameElement>

    >(({headText, bodyText, renderHandler, title, ...props}, ref) => {
    const [headRef, setHeadRef] = useState<HTMLTitleElement | null>();
    const [bodyRef, setBodyRef] = useState<HTMLDivElement | null>();
    useEffect(() => {
        if (headRef && bodyRef) {
            renderHandler(headRef, bodyRef);
        }
    }, [headText, bodyText, headRef, bodyRef]);
    return <Iframe title={title} {...props} ref={ref}>
        <Fragment>
            <title ref={setHeadRef}>Ref</title>
            <style>{BodyStyle}</style>
        </Fragment>
        <div ref={setBodyRef} dangerouslySetInnerHTML={{__html: bodyText}}/>
    </Iframe>
});