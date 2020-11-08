import {Paper, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction} from "@material-ui/core";
import React from "react";
import {useObservableState} from "observable-hooks";
import {Manager} from "../../lib/Manager";

export const LoginOptions: React.FunctionComponent<any> = ({m}: {m: Manager}) => {
    const authOptions = useObservableState(m.authManager.authOptions$, []);
    return <Paper>
        <TextField
            id="email"
            label="Email"
            type="text"
            autoComplete="current-email"
        />
        <TextField
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
        />
        <List dense>
            {authOptions.map(({ label }) => {
                const labelId = `checkbox-list-secondary-label-${label}`;
                return (
                    <ListItem key={label} button
                              onClick={() => {
                                  // @ts-ignore
                                  return window.location = `${process.env.BASE_URL}/auth/${label}`;
                              }}
                    >
                        <ListItemAvatar>
                            <Avatar
                                alt={`Login Label Image`}
                                src={`/static/images//${label}.jpg`}
                            />
                        </ListItemAvatar>
                        <ListItemText id={labelId} primary={`Line item ${label + 1}`} />
                    </ListItem>
                );
            })}
        </List>
    </Paper>
}