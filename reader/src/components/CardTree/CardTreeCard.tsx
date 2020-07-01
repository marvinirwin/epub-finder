import {Manager} from "../../lib/Manager";
import {useObs} from "../../lib/UseObs";
import {ICard} from "../../lib/Interfaces/ICard";
import CardScroller from "../CardScroller";
import React from "react";

export function CardTreeCard({cardManager}: { cardManager: Manager }) {
/*
    const cards = useObs<ICard[] | undefined>(cardManager.currentCards$);
*/
/*
    return cards ? <CardScroller m={cardManager} cards={cards}/> : <div/>
*/
    return <div/>
}