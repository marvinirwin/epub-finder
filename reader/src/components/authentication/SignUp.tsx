import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import React, {useState} from 'react'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import {makeStyles} from '@material-ui/core/styles'

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

export const SignUp = () => {
    const classes = useStyles()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    function handleSubmit(event: Event) {
        event.preventDefault()
    }

    const authenticate = () => {
    }

    return (
        <Paper >
            <Paper className={classes.paper} elevation={6}>
                <div className={classes.container}>
                    <Typography component="h1" variant="h5">
                        {"Sign up"}
                    </Typography>
                    <form
                        className={classes.form}
                        onSubmit={() => { }}
                        noValidate
                    >
                        <TextField
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label={"username"}
                            name="username"
                            autoComplete="username"
                            autoFocus
                        />
                        <TextField
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label={'email'}
                            name="email"
                            autoComplete="email"
                        />
                        <TextField
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label={"password"}
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <TextField
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password_confirm"
                            label={"Confirm password"}
                            type="password"
                            id="password_confirm"
                            autoComplete="current-password"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            {"Sign Up"}
                        </Button>
                    </form>
                </div>
            </Paper>
        </Paper>
    )
}


