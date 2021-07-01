import {Typography} from "@material-ui/core";
import React from "react";

export const SafariNotSupported = () => {
    return <div
        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw'}}>
        <Typography variant='h2'>LanguageTrainer is disabled on Safari, because it will not let me autoplay sounds
            :(</Typography>
    </div>
}