import {makeStyles} from "@material-ui/core/styles";
import {red} from "@material-ui/core/colors";
import {withStyles} from "@material-ui/core";
import MuiExpansionPanel from "@material-ui/core/ExpansionPanel";

const useStyles = makeStyles((theme) => ({
    root: {
        minWidth: '100%'
    },
    media: {
        height: 0,
        paddingTop: '56.25%', // 16:9
    },
    expand: {
        transform: 'rotate(0deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(180deg)',
    },
    avatar: {
        backgroundColor: red[500],
    },
}));

export const ExpansionPanelNoMargin = withStyles({
    root: {
        border: '1px solid rgba(0, 0, 0, .125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        '&$expanded': {
            margin: '0',
        },
    },
    expanded: {
        height: '100%' // Easy way to make it take up all available room when expanded
    },
})(MuiExpansionPanel);
