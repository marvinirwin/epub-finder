import { GridList, GridListTile } from '@material-ui/core'
import React from 'react'
import { ImageObject } from '@shared/'
import Image from 'material-ui-image';

export const ImageSearchResults = ({
    searchResults,
    onClick,
}: {
    searchResults: ImageObject[]
    onClick: (i: ImageObject) => void
}) => {
    return (
        <GridList cellHeight={160} cols={6} className={'image-search-results'}>
            {searchResults.map((imageResult) => (
                <GridListTile
                    style={{ overflow: 'hidden'/*, width: '160x', height: '160px' */}}
                    key={imageResult.thumbnailUrl}
                    className={'image-search-result'}
                >
                    <Image
                        onClick={() => onClick(imageResult)}
                        src={imageResult.thumbnailUrl as string}
                        imageStyle={{width: '160px', height: '160px', objectFit: 'scale-down'}}
                        style={{width: '160px', height: '160px'}}
                        alt={''}
                    />
                </GridListTile>
            ))}
        </GridList>
    )
}
