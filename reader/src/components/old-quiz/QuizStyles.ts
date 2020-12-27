import {makeStyles} from "@material-ui/core/styles";

export const quizStyles = makeStyles((theme) => ({
    card: {
        height: '100%',
        width: '100%',
        display: "flex",
        flexFlow: "column nowrap"
    },
    center: {
        flexGrow: 1,
        textAlign: 'center'
    },
    alignLeft: {
        flexGrow: 1,
        textAlign: 'left'
    },
    cardActions: {
        display: "flex",
        justifyContent: "center",
        backgroundColor: 'transparent',
        zIndex: 2
    },
    cardContent: {
        display: 'grid',
        gridTemplateColumns: '25% 50% 25%',
        marginTop: '50px',
        height: '25vh',
        padding: 0
    }
}));
