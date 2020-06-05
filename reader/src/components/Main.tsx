import {AppSingleton, EditingCardInInterface} from "../AppSingleton";
import {useObs} from "../UseObs";
import {BookInstance} from "../BookManager";
import {ICard} from "../AppDB";
import React, {useEffect, useState} from "react";
import {combineLatest} from "rxjs";
import {CardList} from "../lib/components/Card-Tree";
import {SpineItemMenu} from "../lib/components/SpineItemMenu";
import {MessageList} from "../lib/components/MessageLlist";

export function Main({s}: { s: AppSingleton }) {
    const {m, pm, im, messageBuffer$, renderManager, customCardManager, cardManager} = s;
    const book = useObs<BookInstance | undefined>(m.currentBook$)
    const currentPackage = useObs(pm.currentPackage$);
    const packages = useObs(pm.packages$, pm.packages$.getValue());
    const editingCard = useObs<EditingCardInInterface | undefined>(customCardManager.cardInEditor$);
    const cards = useObs<ICard[] | undefined>(cardManager.currentCards$);

    const [renderInProgress, setRenderInProgress] = useState<Promise<any> | undefined>(undefined)
    const [nextRender, setNextRender] = useState<(() => Promise<any>) | undefined>(undefined)

    const textBuffer = useObs(im.textBuffer$, '');

    useEffect(() => {
        if (!renderInProgress && nextRender) {
            setNextRender(undefined);
            setRenderInProgress(nextRender().then(() => setRenderInProgress(undefined)))
        }
    }, [renderInProgress, nextRender]);

    useEffect(() => {
        combineLatest(
            [
                m.currentBook$,
                cardManager.currentCardMap$,

                m.currentSpineItem$
            ]
        ).subscribe(([bookInstance, cardLookup, spineItem]) => {
            const render = async () => {
                if (bookInstance && bookInstance.book && spineItem) {
                    let elementById = document.getElementById('book');
                    if (!elementById) {
                        throw new Error("Book element not found")
                    }
                    debugger;
                    elementById.textContent = '';
                    const rendition = bookInstance.book.renderTo(elementById, {width: 600, height: 400})
                    const target = spineItem.href;
                    await rendition.display(target);
                    if (cardLookup) {
                        // annotateElements(target, cardLookup, s => renderManager.messages$.next(s));
                    }
                }
            }
            setNextRender(() => render);
        })
    }, [])

    return (
        <div className={'root'}>
            <div className={'card-tree-container'}>
                {/*
                {packages && <CardTree ankiPackages={packages} selectedPackage$={pm.currentPackage$}/>}
*/}
                {cards && <CardList cards={cards}/>}
            </div>
            <div className={'nav-bar'}>
                <div className={'spine-menu-container'}>
                    <SpineItemMenu spine$={m.spineItems$} selectedSpineElement$={m.currentSpineItem$}/>
                </div>
                {/*
                <div className={'book-menu-container'}>
                    <BookMenu books$={m.bookList$} currentBook$={m.currentBook$}/>
                </div>
*/}
                <div className={'input-text'}>
                    <textarea onChange={e => im.textBuffer$.next(e.target.value)} onKeyDown={(e) => {
                        if (e.key === "Enter" && textBuffer) {
                            m.makeSimpleText(textBuffer.slice(10), textBuffer);
                        }
                    }}/>
                </div>
                {/*
                <div>Active Collection: {currentPackage?.name}</div>
*/}
                {/*
                <div>Active Book: {book?.name}</div>
*/}
                {/*
                <div className={'message-list-container'}>
                    {editingCard && <EditingCardComponent editingCard={editingCard}/>}
                </div>
*/}
                <div className={'message-list-container'}>
                    <MessageList messageBuffer$={messageBuffer$}/>
                </div>
            </div>
            <div className={'text-display'}>
                {" "}
                <div id="book" style={{width: '100%', height: '100%'}}/>
            </div>
        </div>
    );
}