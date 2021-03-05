import React, {useContext, useState} from "react";
import {ManagerContext} from "../../../App";
import axios from "axios";

export const SignupLogin = () => {
    const m = useContext(ManagerContext);
    const [emailRef, setEmail] = useState<HTMLInputElement | null>();
    const [passwordRef, setPassword] = useState<HTMLInputElement | null>();

    const [loginEmailRef, setLoginEmail] = useState<HTMLInputElement | null>();
    const [passwordLoginRef, setLoginPassword] = useState<HTMLInputElement | null>();

    function login(email: string, password: string) {
        axios.post(
            '/languagetrainer-auth/login',
            {email, password})
            .then(() => m.authManager.fetchProfile())
    }

    return <div>
        <input ref={setLoginEmail} id={'login-email'}/>
        <input ref={setLoginPassword} id={'login-password'} type="password"/>
        <button
            id={'login-button'}
            onClick={() => login(loginEmailRef?.value || '', passwordLoginRef?.value || '')}
        >
            login
        </button>
        <input id={'signup-email'} ref={setEmail} disabled={false}/>
        <input id={'signup-password'} ref={setPassword} type="password" disabled={false}/>
        <button id={'signup-button'} onClick={() => {
            if (emailRef && passwordRef) {
                const email = emailRef.value;
                const password = passwordRef.value;
                axios.post(
                    '/languagetrainer-auth/signup',
                    {
                        email,
                        password
                    }
                ).then(() => {
                    login(email, password);
                })
            }
        }
        }>sign up
        </button>
    </div>
}