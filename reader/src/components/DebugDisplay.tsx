import {Observable} from "rxjs";
import {useObs} from "../UseObs";
import React from "react";

export default function DebugDisplay({visible$, text$}: {visible$: Observable<any>, text$: Observable<string>}) {
    const v = useObs(visible$);
    const t = useObs(text$);
    return v ? <div className={'debug-menu'} dangerouslySetInnerHTML={{__html: t || ''}}>
    </div> : <div/>
}