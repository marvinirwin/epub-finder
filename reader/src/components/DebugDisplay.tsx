import {Observable} from "rxjs";
import {useObs} from "../lib/Worker/UseObs";
import React from "react";

interface Props {
    visible$: Observable<any>;
    text$: Observable<string>;
}

const DebugDisplay: React.FunctionComponent<Props> = ({visible$, text$, children}) => {
    const visible = useObs(visible$);
    const t = useObs(text$);
    if (children) {
        return <div className={'debug-menu'} style={{display: visible ? 'block' : 'none'}}>
            {children}
        </div>;
    }
    return visible ? <div className={'debug-menu'} dangerouslySetInnerHTML={{__html: t || ''}}/>
        : <div/>;

}

export default DebugDisplay;