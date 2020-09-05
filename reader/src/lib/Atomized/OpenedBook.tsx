import React, {useEffect, useState} from 'react'
import {createPortal} from 'react-dom'
import {OpenBook} from "../BookFrame/OpenBook";
import {useObservableState} from "observable-hooks";
import {InnerHTMLIFrame} from "../../components/Frame/innerHTMLIFrame";
import {AtomizedDocumentStats} from "./AtomizedDocumentStats";


export const OpenedBook: React.FunctionComponent<{openedBook: OpenBook}> = ({openedBook}) => {
    const bookStats = useObservableState<AtomizedDocumentStats>(openedBook.bookStats$)
    return <InnerHTMLIFrame bodyText={bookStats?.body || ''} headText={bookStats?.head || ''}
                            renderHandler={(head, body) =>
        openedBook.handleHTMLHasBeenRendered(head, body)}
    />
}
