import {GridList, GridListTile} from "@material-ui/core";
import React from "react";
import {ImageObject} from "@server/";

export const ImageSearchResults = (
    {searchResults, onClick}:
        { searchResults: ImageObject[], onClick: (i: ImageObject) => void }
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