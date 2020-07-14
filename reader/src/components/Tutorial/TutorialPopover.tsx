import {Button, Popover, Typography} from "@material-ui/core";
import {MutableRefObject, useEffect, useState} from "react";
import React from "react";

export function getTutorialPopper({anchorRef, storageKey, content}: {anchorRef: MutableRefObject<HTMLElement>, storageKey: string, content: string}) {
    const [open ,setOpen] = useState<string | null>("1");
    useEffect(() => {
        setOpen(localStorage.getItem(storageKey))
    }, [])
    useEffect(() => {
        localStorage.setItem(storageKey, open !== null ? open : '')
    }, [open])
    return anchorRef.current && <Popover
        open={[null, '1'].includes(open)}
        anchorEl={anchorRef.current}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
        }}
    >
        <Typography variant="subtitle1">{content}</Typography>
        <Button onClick={() => setOpen("0")}>Hode</Button>

    </Popover>
}
