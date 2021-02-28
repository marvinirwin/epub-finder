import {createStyles, LinearProgress, Theme, withStyles} from "@material-ui/core";

export const BorderLinearProgressComponent = withStyles((theme: Theme) =>
    createStyles({
        root: {
            height: 10,
            borderRadius: 5,
        },
        colorPrimary: {
            backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
        },
        bar: {
            borderRadius: 5,
            backgroundColor: '#5dce05',
        },
    }),
)(LinearProgress);
