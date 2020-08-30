import React, {useEffect, useState, Fragment} from 'react'
import {createPortal} from 'react-dom'
import {Iframe} from './iframe'

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
    debugger;
    return <Iframe>
        <Fragment>
            <head ref={setHeadRef} dangerouslySetInnerHTML={{__html: headText}}/>
            <body ref={setBodyRef} dangerouslySetInnerHTML={{__html: bodyText}}/>
        </Fragment>
    </Iframe>
}