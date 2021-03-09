import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {WordPaperComponent} from "../components/word-paper.component";

export const WordCardDisplay = () => {
    const m = useContext(ManagerContext);
    const wordCard = m.wordCardModalService.wordCard$;
    return <WordPaperComponent
        wordCard={wordCard}
    />;
};