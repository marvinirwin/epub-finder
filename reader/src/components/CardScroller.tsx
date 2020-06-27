import {useState} from "react";
import React from "react";
import {FlashcardPopup} from "./FlashcardPopup";
import {Manager} from "../lib/Manager";
import {ICard} from "../lib/Interfaces/ICard";

export default function CardScroller({cards, m}: { cards: ICard[] , m: Manager}) {
    const [limit, setLimit] = useState(20);

    return <div>
        <div>
            {cards.slice(0, limit).map((question, i) => <div key={i} style={{border: 'thin black 1px', borderRadius: '5px'}} >
                <FlashcardPopup m={m} text={question.learningLanguage} card={question} getImages={undefined}/>
            </div>)
            }
        </div>

        <button onClick={() => setLimit(limit + 50)}>({cards.length - limit})...</button>
    </div>
}