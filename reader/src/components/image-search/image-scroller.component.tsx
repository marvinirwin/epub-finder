import React from "react";
import {Button, GridList, GridListTile,  ListSubheader, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

export const useStylesGridListImages = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
        width: '100%',
        height: '100%',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)',
    },
    title: {
        color: theme.palette.primary.light,
    },
    titleBar: {
        background:
            'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
    },
}));

export default function NotImageList({sources, selectSource}: {sources: string[], selectSource: ((s: string) => any)}) {
    const classes = useStylesGridListImages();
    return <GridList className={classes.gridList}>
        {sources.map((src, index) => {
            return <GridListTile key={index}>
                <img src={src} style={{height: "100px", width: '170px'}} alt={''} />
                <ListSubheader component="div">
                    <Button onClick={() => selectSource(src)}>Select</Button>
                </ListSubheader>
            </GridListTile>
        })}
    </GridList>
}
