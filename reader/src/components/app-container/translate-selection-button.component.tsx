import React, {Fragment, useContext, useEffect, useState} from "react";
import IconButton from "@material-ui/core/IconButton";
import {Translate} from "@material-ui/icons";
import {useTutorialPopOver} from "../tutorial-popover/tutorial-popper.component";
import {ManagerContext} from "../../App";

export const TranslationSelectionButton = () => {
    const m = useContext(ManagerContext);
    const [isSelected, setIsSelected] = useState(false);
    const [translateSelectionRef, TranslateSelectPopover] = useTutorialPopOver(
        'TranslateSelection',
        `Highlight some text and press this button to see a translation`,
    );
    useEffect(() => {
        document.onmouseup = () => {
            const selectionString = document.getSelection()?.toString();
            if (selectionString) {
                setIsSelected(true);
            } else {
                setIsSelected(false);
            }
        }
    }, [])
    return <Fragment>
        <IconButton ref={translateSelectionRef}
                    style={{marginLeft: '8px', marginRight: '8px'}}
                    onClick={() => m.onSelectService.checkForSelectedText(window.document)}
        >
            <Translate
                style={{color: isSelected ? 'white' : undefined}}
            />
        </IconButton>
        <TranslateSelectPopover/>
    </Fragment>;
};