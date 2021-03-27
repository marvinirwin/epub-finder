import React, {Fragment, useContext} from "react";
import {ManagerContext} from "../../App";
import {HotkeyWrapper} from "../hotkeys/hotkey-wrapper";
import {Button} from "@material-ui/core";
import {QUIZ_BUTTON_EASY, QUIZ_BUTTON_HARD, QUIZ_BUTTON_IGNORE, QUIZ_BUTTON_MEDIUM} from "@shared/";

export const DifficultyButtons = () => {
    const m = useContext(ManagerContext)
    return <Fragment>
        <HotkeyWrapper action={"QUIZ_RESULT_HARD"}>
            <Button
                className={QUIZ_BUTTON_HARD}
                onClick={() => m.hotkeyEvents.quizResultHard$.next()}>
                Hard
            </Button>
        </HotkeyWrapper>
        <HotkeyWrapper action={"QUIZ_RESULT_MEDIUM"}>
            <Button
                className={QUIZ_BUTTON_MEDIUM}
                onClick={() => m.hotkeyEvents.quizResultMedium$.next()}>
                Medium
            </Button>
        </HotkeyWrapper>
        <HotkeyWrapper action={"QUIZ_RESULT_EASY"}> <Button
            className={QUIZ_BUTTON_EASY}
            onClick={() => m.hotkeyEvents.quizResultEasy$.next()}
        >
            Easy
        </Button>
        </HotkeyWrapper>
        <HotkeyWrapper action={"QUIZ_RESULT_IGNORE"}>
            <Button
                className={QUIZ_BUTTON_IGNORE}
                onClick={() => {
                    m.hotkeyEvents.quizResultIgnore$.next()
                }}>
                Ignore
            </Button>
        </HotkeyWrapper>
    </Fragment>
};