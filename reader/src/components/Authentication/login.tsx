import React, {useContext} from "react"
import GoogleLogin from "react-google-login";
/*
import FacebookLogin from 'react-facebook-login';
import TwitterLogin from 'react-twitter-auth';
*/
import {ManagerContext} from "../../App";
import {useObservableState} from "observable-hooks";
import {keyBy} from "lodash";

export const Login = () => {
    const m = useContext(ManagerContext);
    const thirdPartyLogins = useObservableState(m.thirdPartyLoginService.thirdPartyLogins$, {settings: []});
    const regrouped = keyBy(thirdPartyLogins.settings, 'thirdPartyName');
    const twitter = regrouped['twitter'];
    const google = regrouped['google'];
    const facebook = regrouped['facebook'];
    return <div>
        {
/*
            twitter && <TwitterLogin
                onFailure={() => {}}
                onSuccess={() => {}}
                />
*/
        }
        {
/*
            facebook && <FacebookLogin
                autoLoad={false}
                fields="name,email,picture"
                callback={() => {}/>
*/
        }
        {
            google && <GoogleLogin
                buttonText="Login"
                onSuccess={() => { }}
                onFailure={() => {}}
                clientId={google.clientId}
            />
        }




    </div>
}
export const Facebook = () => {
}
export const Google = () => {
}
