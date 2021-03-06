import { manualQuizHiddenFieldConfigId } from "@shared/";
import React, {useContext} from "react";
import {ManagerContext} from "../../../App";

export const ManualQuizHiddenFields = () => {
    const m = useContext(ManagerContext);
    return <input
        id={manualQuizHiddenFieldConfigId}
        onChange={v => m.quizService.manualHiddenFieldConfig$.next(v.target.value || '')}
    />
};