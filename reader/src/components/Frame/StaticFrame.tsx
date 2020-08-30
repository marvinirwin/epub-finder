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
        top: '9000px',
        width: '100vw',
        height: '10vh'
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