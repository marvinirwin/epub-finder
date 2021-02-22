import React, {useEffect, useState} from "react";
import {Manager} from "../../lib/Manager";
import {ICard} from "../../../../server/src/shared/ICard";
import {EditingCard} from "../../lib/reactive-classes/EditingCard";

export function CardPopup({text, card, getImages, m}: { text: string, card: ICard, getImages: ((s: string) => Promise<string[]>) | undefined, m: Manager }) {
    const [clicked, setClicked] = useState(false)
    const [insidePopup, setInsidePopup] = useState(false)
    const [srces, setSrces] = useState<string[]>([]);
    useEffect(() => {
        if (getImages) {
            getImages(card.learningLanguage).then((data) => {
                setSrces(data);
            })
        }
    }, [])
    return <span style={{
        fontSize: "200%",
        zIndex: 99,
        font: ' Tahoma, Helvetica, Arial, "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif',
    }}
                 onClick={() => {
                     setClicked(true);
                     m.editingCardManager.queEditingCard$.next(EditingCard.fromICard(
                         card,
                         m.cardDBManager,
                         m.cardsRepository
                     ))
                 }}
                 onMouseLeave={() => setClicked(false)}
    >
        {(clicked || insidePopup) && false &&  <div
            style={{
                position: 'absolute',
            }}
            onMouseEnter={() => setInsidePopup(true)}
            onMouseLeave={() => setInsidePopup(false)}>
            {srces.map(s => <img alt={'image'} key={s} src={s} style={{width: '100px', height: '100px'}}/>)}
            <div dangerouslySetInnerHTML={{__html: card.fields.join('</br>')}}>
            </div>
        </div>}
        {text}
    </span>
}