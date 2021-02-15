import React, {CSSProperties, FunctionComponent, useEffect, useState} from "react";
import {InnerHTMLIFrame} from "./innerHTMLIFrame";

interface props {
    visible: boolean;
    visibleStyle: CSSProperties
}
export const StaticFrame: FunctionComponent<props> = (
    {visible, visibleStyle, children}
    ) => {
    const [el, setEl] = useState();
    const divStyle = visible ? visibleStyle : {
        zIndex: -1,
        width: '100vw',
        height: '10vh',
        overflow: 'hidden'
    };
    return <div style={
        {
            ...divStyle,
            position: 'absolute',
        }
    }>
        {children}
    </div>
}