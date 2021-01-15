import React, {useContext, useState} from "react";
import {ManagerContext} from "../../../App";
import axios from "axios";

export const SignupLogin = () => {
    const m = useContext(ManagerContext);
    const [emailRef, setEmail] = useState<HTMLInputElement | null>();
    const [passwordRef, setPassword] = useState<HTMLInputElement | null>();
    return <div>
        <input id={'login-email'}/>
        <input id={'login-password'} type="password"/>
        <input id={'signup-email'} ref={setEmail} disabled={false}/>
        <input id={'signup-password'} ref={setPassword} type="password" disabled={false}/>
        <button id={'signup-button'} onClick={() => {
            if (emailRef && passwordRef) {
                let email = emailRef.value;
                let password = passwordRef.value;
                axios.post(
                    '/auth/signup',
                    {
                        email: email,
                        password: password
                    }
                ).then(() => {
                    axios.post(
                        '/auth/login',
                        {email, password})
                        .then(() => m.authManager.fetchProfile())
                })
            }
        }
        }>sign up
        </button>
    </div>
}