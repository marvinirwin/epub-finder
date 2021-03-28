import React from "react";
import {GridList, GridListTile, Paper} from "@material-ui/core";

export type FileItem = {
    path: string;
    Component: React.FC
}
export const BackButton: React.FC<{ directory: string[] }> = ({directory}) => {
    if (!directory.length) {
        return null;
    }
    // I might just use paper
    return <GridListTile>
        <Paper>Back</Paper>
    </GridListTile>
}
const directoryFromFilePath = (path: string) => {
    const split = path.split('/');
    if (!split.length) {
        throw new Error(`Invalid path ${path}, does it start with /?`)
    }
    return split.slice(0, -1).join('')
}
export const fileNameFromFilepath = (path: string) => {
    const split = path.split('/');
    if (!split.length) {
        throw new Error(`Invalid path ${path}, does it start with /?`)
    }
    return split[split.length - 1];
}
export const AddLearningMaterial: React.FC<{ files: FileItem[], directory: string[] }> = ({files, directory}) => {
    const directoryString = directory.join('/');
    const itemsInThisDirectory = files.filter(file => directoryFromFilePath(file.path) === directoryString);
    return <GridList cellHeight={160} cols={3}>
        <BackButton directory={directory}/>

        {itemsInThisDirectory.map((tile) => {
            return <GridListTile key={fileNameFromFilepath(tile.path)} cols={1}>
                {tile.Component}
            </GridListTile>
        })}
    </GridList>
};