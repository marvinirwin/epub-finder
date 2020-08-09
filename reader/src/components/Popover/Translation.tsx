import React, {FunctionComponent, ReactNode, useEffect, useState} from "react";
import {usePopper} from "react-popper";
import {makeStyles} from "@material-ui/core/styles";
import {Placement} from "@popperjs/core";
import {AtomizedSentence} from "../../lib/Atomized/AtomizedSentence";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '5px 10px',
        borderRadius: '4px',
        maxWidth: '300px',
        '&:hover': {
            cursor: 'pointer'
        }
    },

}));

export const Translation: FunctionComponent<{ referenceElement: HTMLDivElement | null, atomizedSentence: AtomizedSentence }> =
    ({referenceElement, atomizedSentence, children}) => {
        const [open, setOpen] = useState<boolean>(false);
        const classes = useStyles();
        const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
        const [translation, setTranslation] = useState('');
        useEffect(() => {
            atomizedSentence.getTranslation().then(setTranslation);
        }, [atomizedSentence])

        const x = usePopper(referenceElement, popperElement, {
            placement: 'top',
            strategy: 'fixed'
        });
        if (open) {
            return <div ref={setPopperElement} style={x.styles.popper} {...x.attributes.popper}
                        onMouseLeave={() => setOpen(false)}>
                <div className="POPPER_ELEMENT">
                    {translation}
                </div>
            </div>
        } else {
            return <div/>;
        }

    }
