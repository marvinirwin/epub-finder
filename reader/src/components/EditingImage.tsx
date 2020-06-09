import {EditingCard} from "../lib/EditingCard";
import {ClassNameMap} from "@material-ui/core/styles/withStyles";
import {debounce} from "lodash";
import React, {Fragment, useState} from "react";
import CardMedia from "@material-ui/core/CardMedia";
import {TextField} from "@material-ui/core";

export function EditingImage(
    {
        photos,
        index,
        card,
        src,
        classes,
        characters
    }: { photos: string[], index: number, card: EditingCard, src: string, classes: ClassNameMap<"expand" | "root" | "media" | "avatar" | "expandOpen">, characters: string | undefined }
) {
    const updatePhotoSource = debounce((newSource: string) => {
        const newPhotos: string[] = [...photos];
        newPhotos[index] = newSource;
        card.photos$.next(newPhotos);
    });
    const [currentSource, setCurrentSource] = useState(src);
    return <Fragment>
        <div style={{width: '100%'}}>
            <CardMedia className={classes.media}
                       image={src}
                       style={{width: '170px', height: '100px'}}
                       title={characters}/>
            <form noValidate autoComplete="off">
                <TextField value={currentSource} id="standard-basic" label="Standard" onChange={e => {
                    setCurrentSource(e.target.value);
                    updatePhotoSource(e.target.value);
                }}/>
            </form>
        </div>
    </Fragment>;
}