import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import React, {useState} from 'react'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import {makeStyles} from '@material-ui/core/styles'
import {Link} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    paper: {
        width: 'auto',
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(620 + theme.spacing(6))]: {
            width: 400,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(
            3
        )}px`,
    },
    avatar: {
        margin: theme.spacing(1),
        width: 192,
        height: 192,
        color: theme.palette.secondary.main,
    },
    form: {
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: `100%`,
    },
}))

export const SignIn = () => {
    const classes = useStyles()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    function handleSubmit(event: Event) {
        event.preventDefault()
    }

    return (
        <Paper className={classes.paper} elevation={6}>
            <div className={classes.container}>
                <Typography component="h1" variant="h5">
                    {'sign-in'}
                </Typography>
                <form className={classes.form} onSubmit={(event) => {}} noValidate>
                    <TextField
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label={'username'}
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label={'password'}
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                    >
                        {'sign-in'}
                    </Button>
                </form>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'space-between',
                    }}
                >
                    <Link href="./password_reset">
                        {'forgot password'}?
                    </Link>
                    <Link href="./signup">
                        {'registration'}
                    </Link>
                </div>
            </div>
        </Paper>
    )
}

