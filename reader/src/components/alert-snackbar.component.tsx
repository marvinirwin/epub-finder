import {Snackbar} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";

export const AlertSnackbar = () => {
    const m = useContext(ManagerContext);
    const alertMessages = useObservableState(m.toastMessageService.toastMessageList$);
    return <Snackbar
        open={!!alertMessages?.length}
        autoHideDuration={6000}
        onClose={e => m.alertsService.alertMessagesVisible$.next(false)}>
        <div>
            {
                (alertMessages || []).map(({alert: {msg, severity}}, index) =>
                    <Alert key={index} severity={severity}>
                        {msg}
                    </Alert>
                )
            }
        </div>
    </Snackbar>
}