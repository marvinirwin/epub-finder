import {AppBar, createStyles, fade, IconButton, TextField, Theme, Toolbar, Typography} from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import {ImageSearchRequest} from "@shared/";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(3),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
    }));

export const ImageSearchAppBar = (
    {
        imageRequest,
        onClose,
        searchTerm,
        onSearchTermChanged
    }: {
        imageRequest: undefined | ImageSearchRequest,
        onClose: () => void,
        searchTerm: string | undefined,
        onSearchTermChanged: (s: string | undefined) => void
    }
    ) => {
    const classes = useStyles();
    return <AppBar className={'image-search-app-bar'} position={'sticky'}>
        <Toolbar className={'image-search-toolbar'}>
            <Typography variant="h6" noWrap className={'image-search-term'}>
                {imageRequest?.term}
            </Typography>
            <div className={classes.search}>
                <div className={classes.searchIcon}>
                    <SearchIcon/>
                </div>
                <TextField
                    placeholder="Search…"
                    value={searchTerm}
                    onChange={e => onSearchTermChanged(e.target.value)}
                />
            </div>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                <CloseIcon/>
            </IconButton>
        </Toolbar>
    </AppBar>
}
