import {Snackbar} from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import React, {useContext} from "react";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";

export const AlertSnackbar = () => {
    const m = useContext(ManagerContext);
    const alertMessagesVisible = useObservableState(m.alertsService.alertMessagesVisible$);
    const alertMessages = useObservableState(m.alertsService.alertMessages$);
    return <Snackbar
        open={alertMessagesVisible}
        autoHideDuration={6000}
        onClose={e => m.alertsService.alertMessagesVisible$.next(false)}>
        <div>
            {
                (alertMessages || []).map(({msg, severity}) =>
                    <Alert key={msg} severity={severity}>
                        {msg}
                    </Alert>
                )
            }
        </div>
    </Snackbar>
}