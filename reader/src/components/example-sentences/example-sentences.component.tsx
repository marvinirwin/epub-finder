import { Observable } from "rxjs";
import React, {useContext} from "react";
import { Iframe } from "../Frame/iframe";
import {InnerHTMLIFrame} from "../Frame/innerHTMLIFrame";
import {OpenedDocument} from "../../lib/Atomized/OpenedDocument";
import {CardEntity} from "../quiz/card.entity";
import {ManagerContext} from "../../App";

export const ExampleSentences = ({c}: {c: CardEntity}) => {
    const m = useContext(ManagerContext);
    return <OpenedDocument openedDocument={c.openDocument} />
}