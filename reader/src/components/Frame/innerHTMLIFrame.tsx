import React, {useEffect, useState, Fragment} from 'react'
import {createPortal} from 'react-dom'
import {Iframe} from './iframe'
import {BodyStyle} from "../../lib/BookFrame/AppendBookStyle";

export type IFrameRenderHandler = (head: HTMLHeadElement, body: HTMLBodyElement) => void;

export const InnerHTMLIFrame: React.FunctionComponent<{
    headText: string,
    bodyText: string,
    renderHandler: IFrameRenderHandler
}> = ({headText, bodyText, renderHandler}) => {
    const [headRef, setHeadRef] = useState();
    const [bodyRef, setBodyRef] = useState();
    useEffect(() => {
        if (headRef && bodyRef) {
            renderHandler(headRef, bodyRef);
        }
    }, [headText, bodyText, headRef, bodyRef]);
    return <Iframe>
        <Fragment>
            <title ref={setHeadRef}>Ref</title>
            <style>{BodyStyle}</style>
        </Fragment>
        <div ref={setBodyRef} dangerouslySetInnerHTML={{__html: bodyText}}/>
    </Iframe>
}