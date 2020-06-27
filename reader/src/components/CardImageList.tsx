import {GridList, GridListTile, GridListTileBar} from "@material-ui/core";
import {EditingImage} from "./EditingImage";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import {makeStyles} from "@material-ui/core/styles";
import {EditingCard} from "../lib/ReactiveClasses/EditingCard";
import {Subject} from "rxjs";
import {useObs} from "../UseObs";
import React from "react";
import {Manager} from "../lib/Manager/Manager";
import LibraryAddIcon from "@material-ui/icons/LibraryAdd";

const useStylesGridListImages = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    gridList: {
        flexWrap: 'nowrap',
        width: '100%',
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
export default function ({photos$, card, characters, m}: { photos$: Subject<string[]>, card: EditingCard, characters: string, m: Manager }) {
    const classes = useStylesGridListImages();
    const photos = useObs(photos$);
    const cb = () => card.m.queryImageRequest.next({
        term: characters,
        cb: (s: string) => card.photos$.next(photos?.concat(s))
    });
    return photos?.length ?
        <GridList className={classes.gridList}>
            {photos?.map((src, index) => {
                return <EditingImage key={index} index={index} card={card} src={src}
                                     photos={photos} characters={characters}
                                     addCb={index === photos?.length - 1 ? cb : undefined}
                />
            })}
        </GridList> : <div>
            <IconButton onClick={cb}>
                <LibraryAddIcon/>
            </IconButton>
        </div>
}
