import {GridList, GridListTile, GridListTileBar} from "@material-ui/core";
import {EditingImage} from "./EditingImage";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import {makeStyles} from "@material-ui/core/styles";
import {EditingCard} from "../lib/EditingCard";
import {Subject} from "rxjs";
import {useObs} from "../UseObs";
import React from "react";

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
export default function({photos$, card, characters}: {photos$: Subject<string[]>, card: EditingCard, characters: string}) {
    const classes = useStylesGridListImages();
    const photos = useObs(photos$);
    return <GridList className={classes.gridList}>
        {photos?.map((src, index) => {
            return <EditingImage key={index} index={index} card={card} src={src}
                                 photos={photos} characters={characters}/>
        })}
        <GridListTile key={"new_image"}>
            <img
                src={"https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.cleanpng.com%2Fpng-plus-and-minus-signs-computer-icons-clip-art-1986252%2F&psig=AOvVaw0f86FzByOQQU96qpRhXWIg&ust=1591983528914000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCPC-2Pmm-ukCFQAAAAAdAAAAABAD"}
                alt={"New Image"} />
            <GridListTileBar
                title={"new "}
                classes={{
                    root: classes.titleBar,
                    title: classes.title,
                }}
                actionIcon={
                    <IconButton aria-label={`Add new image`} onClick={() => photos$.next((photos || []).concat(''))}>
                        <AddIcon/>
                    </IconButton>
                }
            />
        </GridListTile>
    </GridList>
}
