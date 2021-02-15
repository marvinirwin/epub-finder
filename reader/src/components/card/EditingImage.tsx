import {EditingCard} from "../../lib/reactive-classes/EditingCard";
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {debounce} from "lodash";
import React, {Fragment, useState} from "react";
import CardMedia from "@material-ui/core/CardMedia";
import {ListSubheader, TextField} from "@material-ui/core";
import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import IconButton from "@material-ui/core/IconButton";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";
import DeleteIcon from "@material-ui/icons/Delete";
import {makeStyles} from "@material-ui/core/styles";
import {HotkeyWrapper} from "../hotkey-wrapper";


const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
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

export function EditingImage(
    {
        photos,
        index,
        card,
        src,
        characters,
        addCb
    }: { photos: string[], index: number, card: EditingCard, src: string, characters: string | undefined, addCb: undefined | (() => void) }
) {
    const updatePhotoSource = debounce((newSource: string) => {
        const newPhotos: string[] = [...photos];
        newPhotos[index] = newSource;
        card.photos$.next(newPhotos);
    });
    const classes = useStyles();
    const [currentSource, setCurrentSource] = useState(src);
    return <GridListTile key={index}>
        <img src={src} style={{height: "100px", width: '170px'}} alt={characters}/>
        <GridListTileBar
            title={<IconButton onClick={() => console.log('TODO')}>
                <DeleteIcon/>
            </IconButton>}
            titlePosition="top"
            actionIcon={
                addCb ?
                    <IconButton onClick={addCb}>
                        <LibraryAddIcon/>
                    </IconButton> : ''
            }
            actionPosition="left"
            className={classes.titleBar}
        />
        <ListSubheader component="div">
            <form noValidate autoComplete="off">
                <TextField value={currentSource} id="standard-basic" label="Standard" onChange={e => {
                    setCurrentSource(e.target.value);
                    updatePhotoSource(e.target.value);
                }}/>
            </form>
        </ListSubheader>
    </GridListTile>
        ;
}