import React from "react";
import {Toolbar, Typography} from "@material-ui/core";

export const ProgressTableToolbar: React.FC<{}> = () => {
    return <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h6" component="div">
            Progress Made
        </Typography>
    </Toolbar>
};