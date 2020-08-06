import {Observable} from "rxjs";
import React from "react";
import {useObservableState} from "observable-hooks";

interface Props {
    visible$: Observable<any>;
    text$: Observable<string>;
}

const DebugDisplay: React.FunctionComponent<Props> = ({visible$, text$, children}) => {
    const visible = useObservableState(visible$);
    const t = useObservableState(text$);
    if (children) {
        return <div className={'debug-menu'} style={{display: visible ? 'block' : 'none'}}>
            {children}
        </div>;
    }
    return visible ? <div className={'debug-menu'} dangerouslySetInnerHTML={{__html: t || ''}}/>
        : <div/>;

}

export default DebugDisplay;