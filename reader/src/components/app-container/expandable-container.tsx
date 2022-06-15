import React, {useEffect, useMemo, useRef, useState} from 'react'
import {useConditionalTimeout, useDebouncedFn, useResizeObserver,} from 'beautiful-react-hooks'
import {Observable, of} from 'rxjs'
import {useSubscription} from 'observable-hooks'
import { Button, Typography } from '@material-ui/core'

const dimensions = (
    container: HTMLElement | undefined | null,
): React.CSSProperties => {
    // TODO maybe handle lots of children and pick the largest?
    const child = container?.children?.[0]
    if (child) {
        const height = child.clientHeight
        return {
            height,
            maxHeight: height,
        }
    }
    return {}
}
const blankObs = of()

export const ExpandableContainer: React.FC<{
    shouldShow: boolean
    hideDelay?: number
    resizeObservable$?: Observable<void>
    name?: string
    children?: React.ReactNode
}> = ({children, shouldShow, hideDelay, name, resizeObservable$}) => {
    const ref = useRef<HTMLElement | null | undefined>()
    const [styles, setStyles] = useState({})
    // @ts-ignore
    const DOMRect = useResizeObserver(ref, 500)

    const [isCleared, clearTimeoutRef] = useConditionalTimeout(
        () => {
            setStyles({
                height: 0,
                maxHeight: 0,
            })
        },
        hideDelay || 0,
        shouldShow,
    )

    const setDims = useDebouncedFn(() => {
        if (shouldShow) {
            clearTimeoutRef()
            setStyles(dimensions(ref?.current))
        }
    })
    useEffect(() => {
        return () => {
            clearTimeoutRef()
            setDims.cancel()
        }
    }, [])

    useSubscription(resizeObservable$ || blankObs, () => setDims())

    useEffect(() => {
        setDims()
    }, [shouldShow, DOMRect])
    // @ts-ignore
    return (
        <div className={`expandable`} ref={v => ref.current = v} style={styles}>
            {children}
        </div>
    )
}

export const ExpandOnClick: React.FC<{ label: string, children?: React.ReactNode }> = (
    {children, label}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const divClass = useMemo(() => {
        return isExpanded ?
            'open' :
            'closed'
    }, [isExpanded])
    return <div className={`expand-on-click ${divClass}`} onClick={() => setIsExpanded(!isExpanded)}>
        {
            isExpanded && <div className={`expand-on-click-child-container ${divClass}`}> {children} </div>

        }<Button
        onClick={() => setIsExpanded(!isExpanded)}>
        <Typography variant={'h5'}>{label}</Typography>
    </Button>
    </div>
}
