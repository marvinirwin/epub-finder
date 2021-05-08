import React, { useContext, useEffect, useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import { ImageObject } from '@server/types'
import {
    AppBar,
    createStyles,
    fade,
    GridList,
    GridListTile,
    IconButton,
    TextField,
    Theme,
    Toolbar,
    Typography,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { debounce } from 'lodash'
import { useObservableState } from 'observable-hooks'
import { getImages } from '../../services/image-search.service'
import { ImageResult } from './image-search-result.interface'
import { Transition } from './slide-up.component'
import { ImageSearchResults } from './image-search-results.component'
import { ImageSearchAppBar } from './image-search-app-bar.component'
import { ManagerContext } from '../../App'
import { useDebouncedFn } from 'beautiful-react-hooks'

export interface ImageSearchResponse {
    images: ImageResult[]
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        title: {
            marginLeft: theme.spacing(2),
            flex: 1,
        },
        root: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            backgroundColor: theme.palette.background.paper,
            maxWidth: '100%',
        },
        tile: {
            overflow: 'hidden',
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('md')]: {
                width: '20ch',
            },
        },
    }),
)

export function ImageSearchComponent() {
    const classes = useStyles()
    const m = useContext(ManagerContext)
    const imageRequest = useObservableState( m.imageSearchService.queryImageRequest$)
    const [searchTerm, setSearchTerm] = useState(imageRequest)
    const loading  = useObservableState(m.imageSearchService.results$.isLoading$);
    const sources = useObservableState(m.imageSearchService.results$.obs$) || [];
    const cb = useObservableState(m.imageSearchService.queryImageCallback$);
    return (
        <Dialog
            id="image-search-dialog"
            fullScreen
            open={!!imageRequest}
            TransitionComponent={Transition}
        >
            <div className={`image-search-container ${classes.root}`}>
                <ImageSearchAppBar
                    onClose={close}
                    searchTerm={searchTerm}
                    onSearchTermChanged={setSearchTerm}
                />
                {loading ? (
                    `Loading ${loading}`
                ) : sources.length ? (
                    <ImageSearchResults
                        searchResults={sources}
                        onClick={(result) => {
                            if (cb) {
                                cb(result.thumbnailUrl || '')
                            }
                            close()
                        }}
                    />
                ) : (
                    <div>No search results for {searchTerm}?</div>
                )}
            </div>
        </Dialog>
    )
}
