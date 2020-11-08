import React, {useEffect, useState, Fragment} from 'react'
import {Iframe} from './iframe'
import {BodyStyle} from "../../lib/BookFrame/AppendBookStyle";

export type IFrameRenderHandler = (head: HTMLTitleElement, body: HTMLDivElement) => void;

export const InnerHTMLIFrame: React.FunctionComponent<{
    headText: string,
    bodyText: string,
    renderHandler: IFrameRenderHandler,
    title: string
}> = ({headText, bodyText, renderHandler, title}) => {
    const [headRef, setHeadRef] = useState<HTMLTitleElement | null>();
    const [bodyRef, setBodyRef] = useState<HTMLDivElement | null>();
    useEffect(() => {
        if (headRef && bodyRef) {
            renderHandler(headRef, bodyRef);
        }
    }, [headText, bodyText, headRef, bodyRef]);
    return <Iframe title={title}>
        <Fragment>
            <title ref={setHeadRef}>Ref</title>
            <style>{BodyStyle}</style>
        </Fragment>
        <div ref={setBodyRef} dangerouslySetInnerHTML={{__html: bodyText}}/>
    </Iframe>
}