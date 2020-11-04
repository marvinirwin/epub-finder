import {Paper, TextField, List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction} from "@material-ui/core";
import React from "react";

export const LoginOptions: React.FunctionComponent<any> = () => {
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
            {['twitter', 'github', 'google'].map((strategy) => {
                const labelId = `checkbox-list-secondary-label-${strategy}`;
                return (
                    <ListItem key={strategy} button
                              onClick={() => window.location = `${process.env.BASE_URL}/auth/${strategy}`}
                    >
                        <ListItemAvatar>
                            <Avatar
                                alt={`Avatar n°${strategy + 1}`}
                                src={`/static/images/avatar/${strategy + 1}.jpg`}
                            />
                        </ListItemAvatar>
                        <ListItemText id={labelId} primary={`Line item ${strategy + 1}`} />
                    </ListItem>
                );
            })}
        </List>
    </Paper>
}