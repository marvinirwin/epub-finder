import React, {useEffect, useRef, useState} from "react";

export const ExpandableContainer: React.FC<{ shouldShow: boolean }> = ({children, shouldShow}) => {
    const [container, setContainer] = useState<HTMLDivElement | null>();
    const [styles, setStyles] = useState({});
    useEffect(() => {
        setTimeout(() => {
            if (shouldShow) {
                // TODO maybe handle lots of children and pick the largest?
                const child = container?.children?.[0];
                debugger;
                if (child) {
                    setStyles({
                        height: child.clientHeight,
                        maxHeight: child.clientHeight
                    });
                }
            } else {
                setStyles({
                    height: 0,
                    maxHeight: 0
                })
            }
        }, 10);
    }, [shouldShow]);

    return <div className={`expandable`} ref={setContainer} style={styles}>
        {children}
    </div>
}