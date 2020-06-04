import {Card} from "./worker-safe/Card";
import React, {useEffect, useState} from "react";
import {ICard} from "../AppDB";

export function FlashcardPopup({text, card, getImages}: { text: string, card: ICard, getImages: ( (s: string) => Promise<string[]>) | undefined }) {
    const [insideCharacter, setInsideCharacter] = useState(false)
    const [insidePopup, setInsidePopup] = useState(false)
    const [srces, setSrces] = useState<string[]>([]);
    useEffect(() => {
        if (getImages) {
            getImages(card.characters).then((data) => {
                setSrces(data);
            })
        }
    }, [])
    return <span
        onClick={() => setInsideCharacter(true)}
        onMouseLeave={() => setInsideCharacter(false)}
    >
        {(insideCharacter || insidePopup) && <div
            style={{
                position: 'absolute',
                background: 'white',
                border: 'solid black 1px',
                borderRadius: '5px',
                zIndex: 99,
                font: ' Tahoma, Helvetica, Arial, "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif'
            }}
            onMouseEnter={() => setInsidePopup(true)}
            onMouseLeave={() => setInsidePopup(false)} >
            {srces.map(s => <img key={s} src={s}/>)}
            <div dangerouslySetInnerHTML={{__html: card.fields.join('</br>')}}>
        </div>
        </div>}
        {text}
    </span>
}