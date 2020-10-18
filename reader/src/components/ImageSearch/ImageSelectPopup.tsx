import React, {useEffect, useState} from "react";
import {Manager} from "../../lib/Manager";
import axios from 'axios';
import Dialog from "@material-ui/core/Dialog";
import CloseIcon from '@material-ui/icons/Close';
import {
    AppBar,
    createStyles,
    fade,
    GridList,
    GridListTile, IconButton, InputBase,
    Slide, TextField, Theme, Toolbar, Typography
} from "@material-ui/core";
import {TransitionProps} from "@material-ui/core/transitions";
import {makeStyles} from "@material-ui/core/styles";
import SearchIcon from '@material-ui/icons/Search';
import {debounce} from 'lodash';
import {useObservableState} from "observable-hooks";
import {search} from "../../../../server/src/types/fbgraph";

export const getImages = (term: string) => {
    return axios.post(`${process.env.PUBLIC_URL}/image-search`, {term})
}

export interface ImageResult {
    contentUrl: string;
    height: number;
    width: number;
    thumbnailUrl: string;
    thumbnail: {
        width: number,
        height: number
    }
}

export interface ImageSearchResponse {
    images: ImageResult[]
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            position: 'relative',
        },
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
        gridList: {},
        tile: {
            overflow: 'hidden',
        },
        search: {
            position: 'relative',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginRight: theme.spacing(2),
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(3),
                width: 'auto',
            },
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children?: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function ImageSelectPopup({m}: { m: Manager }) {
    const classes = useStyles();
    const imageRequest = useObservableState(m.queryImageRequest$)
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
        m.queryImageRequest$.next();
    }

    useEffect(() => {
        if (searchTerm) {
            debounceSearch(searchTerm)
        }
    }, [searchTerm]);

    const SearchResults = () => sources.length ? <GridList cellHeight={160} className={classes.gridList} cols={12}>
        {sources.map((src, index) => {
            return <GridListTile
                className={classes.tile}
                key={index}
            >
                <img onClick={() => {
                    debugger;
                    imageRequest?.cb(src.thumbnailUrl); // TODO download the thumbnail as base64
                    m.queryImageRequest$.next(undefined);
                }}
                     src={src.thumbnailUrl}
                     alt={''}/>
            </GridListTile>
        })}
    </GridList> : <div>`No results for found for ${searchTerm}, this should never happen, is it a bug?`</div>

    const onClose = () => m.queryImageRequest$.next(undefined);
    return <Dialog fullScreen open={!!imageRequest} onClose={onClose} TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
            <Toolbar>
                <Typography variant="h6" noWrap>
                    {imageRequest?.term}
                </Typography>
                <div className={classes.search}>
                    <div className={classes.searchIcon}>
                        <SearchIcon/>
                    </div>
                    <TextField
                        placeholder="Search…"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
                    <CloseIcon/>
                </IconButton>
            </Toolbar>
        </AppBar>
        <div className={classes.root}>
            {loading ? `Loading ${loading}` : <SearchResults/>}
        </div>
    </Dialog>
}