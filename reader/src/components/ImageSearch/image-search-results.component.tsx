import {GridList, GridListTile} from "@material-ui/core";
import React from "react";
import {ImageResult} from "./image-search-result.interface";

export const ImageSearchResults = (
    {searchResults, onClick}:
        { searchResults: ImageResult[], onClick: (i: ImageResult) => void }
) => {
    return <GridList cellHeight={160} cols={12} className={'image-search-results'}>
        {searchResults.map((imageResult, index) =>
            <GridListTile
                style={{overflow: 'hidden'}}
                key={index}
                className={'image-search-result'}
            >
                <img onClick={() => onClick(imageResult)}
                     src={imageResult.thumbnailUrl}
                     alt={''}/>
            </GridListTile>)
        }
    </GridList>
}