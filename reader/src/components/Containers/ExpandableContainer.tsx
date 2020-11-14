import React, {useEffect, useRef, useState} from "react";


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
        hideDelay
    }
    ) => {
    const [container, setContainer] = useState<HTMLDivElement | null>();
    const [styles, setStyles] = useState({});
    useEffect(() => {
        setTimeout(() => {
            if (shouldShow && container) {
                setDimensions(container, setStyles)
            } else {
                if (hideDelay !== undefined) {
                    setTimeout(() => {
                        setStyles({
                            height: 0,
                            maxHeight: 0
                        })
                    }, hideDelay)
                } else {
                    setStyles({
                        height: 0,
                        maxHeight: 0
                    })
                }
            }
        }, 10);
    }, [shouldShow]);

    return <div className={`expandable`} ref={setContainer} style={styles}>
        {children}
    </div>
}