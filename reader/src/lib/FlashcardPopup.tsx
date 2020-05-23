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
                zIndex: 99
            }}
            onMouseEnter={() => setInsidePopup(true)}
            onMouseLeave={() => setInsidePopup(false)}
            dangerouslySetInnerHTML={{__html: card.front}}>

        </div>}
        {text}
    </span>
}