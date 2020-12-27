import React from "react";
import {CardEntity} from "./card.entity";

export const CardImage = ({c}:{c: CardEntity}) => {
    return <div>
        Click to edit, and put a transparent icon here
        <img src={'TODO'} style={{height: "100px", width: '170px'}} alt={'TODO'}/>
    </div>
}