import React, {useEffect, useState} from "react";
import {Manager} from "../../lib/Manager";
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from '@material-ui/icons/Close';
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
    Typography
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import SearchIcon from '@material-ui/icons/Search';
import {debounce} from 'lodash';
import {useObservableState} from "observable-hooks";
import {getImages} from "../../services/image-search.service";
import {ImageResult} from "./image-search-result.interface";
import {Transition} from "./slide-up.component";
import {ImageSearchResults} from "./image-search-results.component";
import {ImageSearchAppbar} from "./image-search-appbar.component";


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
            maxWidth: '100%'
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
);

export function ImageSearchComponent({m}: { m: Manager }) {
    const classes = useStyles();
    const imageRequest = useObservableState(m.imageSearchService.queryImageRequest$)
    const [searchTerm, setSearchTerm] = useState(imageRequest?.term);
    const [loading, setLoading] = useState("");
    const [sources, setSrces] = useState<ImageResult[]>([]);
    const debounceSearch = debounce((term: string) => {
        setLoading(term);
        getImages(term).then((response) => {
            const results: ImageSearchResponse = response.data;
            setSrces(results.images);
        }).finally(() => {
            setLoading('');
        })
    }, 1000);
    useEffect(() => {
        setSearchTerm(imageRequest?.term)
    }, [imageRequest])

    function close() {
        m.imageSearchService.queryImageRequest$.next();
    }

    useEffect(() => {
        if (searchTerm) {
            debounceSearch(searchTerm)
        }
    }, [searchTerm]);

    const onClose = () => m.imageSearchService.queryImageRequest$.next(undefined);
    return <Dialog fullScreen open={!!imageRequest} onClose={onClose} TransitionComponent={Transition}>
        <div className={classes.root}>
            <ImageSearchAppbar
                imageRequest={imageRequest}
                onClose={close}
                searchTerm={searchTerm}
                onSearchTermChanged={setSearchTerm}
            />
            {
                loading ?
                    `Loading ${loading}` :
                    sources.length ?
                        <ImageSearchResults
                            searchResults={sources}
                            onClick={result => {
                                imageRequest?.cb(result.thumbnailUrl);
                                close()
                            }}
                        /> :
                        <div>No search results for {searchTerm}?</div>
            }
        </div>
    </Dialog>
}