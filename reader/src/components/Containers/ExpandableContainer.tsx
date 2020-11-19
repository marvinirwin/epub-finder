import React, {useEffect, useRef, useState} from "react";
import {useConditionalTimeout, useResizeObserver} from 'beautiful-react-hooks';


const setDimensions = (container: HTMLDivElement, setStyles: (p: React.CSSProperties) => void) => {
    // TODO maybe handle lots of children and pick the largest?
    const child = container?.children?.[0];
    if (child) {
        setStyles({
            height: child.clientHeight,
            maxHeight: child.clientHeight
        });
    }
}

export const ExpandableContainer: React.FC<{ shouldShow: boolean, hideDelay?: number }> = (
    {
        children,
        shouldShow,
        hideDelay,
    }
) => {
    const ref = useRef();
    const [styles, setStyles] = useState({});
    // @ts-ignore
    const DOMRect = useResizeObserver(ref);

    const [isCleared, clearTimeoutRef] = useConditionalTimeout(()=>{
       setStyles({
           height: 0,
           maxHeight: 0
       })
   }, hideDelay || 0, !shouldShow);

    useEffect(() => {
        shouldShow && clearTimeoutRef();
        if (shouldShow && ref?.current) {
            // @ts-ignore
            setDimensions(ref?.current, setStyles)
        } else {
            if (hideDelay !== undefined) {
                setTimeout(() => {
                }, hideDelay)
            } else {
            }
        }
    }, [shouldShow, DOMRect?.height, DOMRect?.width]);

    // @ts-ignore
    return <div className={`expandable`} ref={ref} style={styles}>
        {children}
    </div>
}