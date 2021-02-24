import React, {useEffect, useRef, useState} from "react";
import {useConditionalTimeout, useDebouncedFn, useResizeObserver, useTimeout} from 'beautiful-react-hooks';
import {Observable, of} from "rxjs";
import {useSubscription} from "observable-hooks";


const dimensions = (container: HTMLElement | undefined): React.CSSProperties => {
    // TODO maybe handle lots of children and pick the largest?
    const child = container?.children?.[0];
    if (child) {
        const height = child.clientHeight;
        return {
            height,
            maxHeight: height
        }
    }
    return {}
}
const blankObs = of();

export const ExpandableContainer: React.FC<{ shouldShow: boolean, hideDelay?: number, resizeObservable$?: Observable<void>, name?: string }> = (
    {
        children,
        shouldShow,
        hideDelay,
        name,
        resizeObservable$
    }
) => {
    const ref = useRef<HTMLElement>();
    const [styles, setStyles] = useState({});
    // @ts-ignore
    const DOMRect = useResizeObserver(ref, 500);

    const [isCleared, clearTimeoutRef] = useConditionalTimeout(() => {
        setStyles({
            height: 0,
            maxHeight: 0
        })
    }, hideDelay || 0, shouldShow);

    const setDims = useDebouncedFn(() => {
        if (shouldShow) {
            clearTimeoutRef();
            setStyles(dimensions(ref?.current))
        }
    });
    useEffect(() => {
        return () => {
            clearTimeoutRef();
            setDims.cancel();
        };
    }, [])

    useSubscription(resizeObservable$ || blankObs, () => setDims())

    useEffect(() => {
        setDims()
    }, [shouldShow, DOMRect]);
    // @ts-ignore
    return <div className={`expandable`} ref={ref} style={styles}>
        {children}
    </div>
}