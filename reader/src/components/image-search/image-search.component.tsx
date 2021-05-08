import React, { useContext, useState } from 'react'
import { Box, createStyles, IconButton, Paper, TextField, Theme, Toolbar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useObservableState } from 'observable-hooks'
import { ImageResult } from './image-search-result.interface'
import { ImageSearchResults } from './image-search-results.component'
import { ManagerContext } from '../../App'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close'

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
    const imageRequest = useObservableState(m.imageSearchService.queryImageRequest$)
    const [searchTerm, setSearchTerm] = useState(imageRequest)
    const loading = useObservableState(m.imageSearchService.results$.isLoading$)
    const sources = useObservableState(m.imageSearchService.results$.obs$) || []
    const cb = useObservableState(m.imageSearchService.queryImageCallback$)
    return (
        <Paper id='image-search-dialog'>
            <Box m={2} p={1}>
                <TextField
                    placeholder='Search…'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div>
                    <div>
                        <SearchIcon />
                    </div>
                </div>
                <IconButton
                    edge="start"
                    color="inherit"
                    onClick={() => m.modalService.imageSearch.open$.next(false)}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
                <div className={`image-search-container ${classes.root}`}>
                    {loading ? (
                        `Loading ${loading}`
                    ) : sources.length ? (
                        <ImageSearchResults
                            searchResults={sources}
                            onClick={(result) => {
                                if (cb) {
                                    // TODO should I use getDataUrl here?
                                    cb(result.thumbnailUrl || '')
                                }
                                close()
                            }}
                        />
                    ) : (
                        <div>No search results for {searchTerm}?</div>
                    )}
                </div>
            </Box>
        </Paper>
    )
}
