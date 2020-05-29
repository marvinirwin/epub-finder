import {Card} from "./worker-safe/Card";
import React, {useState} from "react";

export function FlashcardPopup({text, card}: { text: string, card: Card }) {
    const [insideCharacter, setInsideCharacter] = useState(false)
    const [insidePopup, setInsidePopup] = useState(false)
    return <span
        onMouseEnter={() => setInsideCharacter(true)}
        onMouseLeave={() => setInsideCharacter(false)}
    >
        {(insideCharacter || insidePopup) && <div
            style={{
                position: 'absolute',
                background: 'white',
                border: 'solid black 1px',
                borderRadius: '5px',
                zIndex: 99,
                font: 'font-family: Tahoma, Helvetica, Arial, "Microsoft Yahei","微软雅黑", STXihei, "华文细黑", sans-serif;'
            }}
            onMouseEnter={() => setInsidePopup(true)}
            onMouseLeave={() => setInsidePopup(false)}
            dangerouslySetInnerHTML={{__html: card.back}}>

        </div>}
        {text}
    </span>
}