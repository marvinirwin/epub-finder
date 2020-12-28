import {GridList, GridListTile} from "@material-ui/core";
import React from "react";
import {ImageResult} from "./image-search-result.interface";

export const ImageSearchResults = (
    {searchResults, onClick}:
        { searchResults: ImageResult[], onClick: (i: ImageResult) => void }
) => {
    return <GridList cellHeight={160} cols={12}>
        {searchResults.map((imageResult, index) =>
            <GridListTile
                style={{overflow: 'hidden'}}
                key={index}
            >
                <img onClick={() => onClick(imageResult)}
                     src={imageResult.thumbnailUrl}
                     alt={''}/>
            </GridListTile>)
        }
    </GridList>
}