import React, {CSSProperties, FunctionComponent, useEffect, useState} from "react";
import {InnerHtmlFrameComponent} from "./inner-html-frame.component";

interface props {
    visible: boolean;
    visibleStyle: CSSProperties
}
export const StaticFrameComponent: FunctionComponent<props> = (
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