import React, {useContext, useState} from 'react'
import {Box, createStyles, IconButton, Paper, TextField, Theme, LinearProgress} from '@material-ui/core'
import {makeStyles} from '@material-ui/core/styles'
import {useObservableState} from 'observable-hooks'
import {ImageResult} from './image-search-result.interface'
import {ImageSearchResults} from './image-search-results.component'
import {ManagerContext} from '../../App'
import CloseIcon from '@material-ui/icons/Close'
import {useTutorialPopOver} from "../tutorial-popover/tutorial-popper.component";
import {observableLastValue} from "../../services/observableLastValue";

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
    const sources = useObservableState(m.imageSearchService.results$.obs$) || [];
    const [removePictureRef, RemovePicture] = useTutorialPopOver(
        'clearImage',
        `Choose no image for this word`,
    )
    return (
        <Paper id='image-search-dialog' style={{height: '90vh', width: '90vw'}}>
            <Box m={2} p={1}>
                <div style={{display: 'flex'}}>
                        <IconButton
                            ref={removePictureRef}
                            edge='start'
                            color='inherit'
                            onClick={async () => {
                                const cb = await observableLastValue(m.imageSearchService.queryImageCallback$)
                                if (cb) {
                                    cb('')
                                }
                                m.modalService.imageSearch.open$.next(false);
                            }}
                            aria-label='close'
                        >
                            <CloseIcon/>
                            <RemovePicture/>
                        </IconButton>
                    &nbsp;
                    &nbsp;
                    <TextField
                        placeholder='Search…'
                        value={searchTerm}
                        onChange={(e) => {
                            m.imageSearchService.queryImageRequest$.next(e.target.value);
                            setSearchTerm(e.target.value)
                        }}
                    />
                </div>
                <div className={`image-search-container ${classes.root}`}>
                    {loading ? <LinearProgress/> : sources.length ? (
                        <ImageSearchResults
                            searchResults={sources}
                            onClick={async (result) => {
                                const cb = await observableLastValue(m.imageSearchService.queryImageCallback$)
                                if (cb) {
                                    // TODO should I use getDataUrl here?
                                    cb(result.thumbnailUrl || '')
                                }
                                m.modalService.imageSearch.open$.next(false);
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
