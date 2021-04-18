import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import { Placement } from '@popperjs/core'
import { Box, Popover } from '@material-ui/core'

export function tryParse<T>(serialized: string, defaultVal: T): T {
    try {
        return JSON.parse(serialized)
    } catch (e) {
        return defaultVal
    }
}

export const TutorialPopper = ({
                                   referenceElement,
                                   storageKey,
                                   children,
                                   placement,
                               }: {
    referenceElement: HTMLElement
    storageKey: string
    children?: ReactNode
    placement?: Placement
}) => {
    const [mouseEntered, setMouseEntered] = useState<boolean>()
    const [disabled, setDisabled] = useState<boolean>()
    useEffect(() => {
        setDisabled(tryParse(localStorage.getItem(storageKey) || 'false', false))
    }, [])
    const onClick = useCallback(() => {
        localStorage.setItem(storageKey, (disabled as unknown) as string)
        setDisabled(true)
    }, [])
    useEffect(() => {
        referenceElement.onmouseenter = () => setMouseEntered(true)
        referenceElement.onmouseleave = () => setMouseEntered(false)
    }, [referenceElement])
    if (mouseEntered && !disabled) {
        return (
            <Popover
                open={mouseEntered}
                anchorEl={referenceElement}
                onClick={onClick}
                style={{ pointerEvents: 'none' }}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                <Box p={1}>
                    {children}
                </Box>
            </Popover>
        )
    } else {
        return null
    }
}

export function useTutorialPopOver<T extends (HTMLElement | HTMLButtonElement)>(storageKey: string, text: string): [
    (ref: null | T) => void,
    React.FC
] {
    const [ref, setRef] = useState<T | null>(null)
    return [
        setRef,
        () => ref ?
            <TutorialPopper referenceElement={ref} storageKey={storageKey}>
                {text}
            </TutorialPopper> :
            null,
    ]
}
