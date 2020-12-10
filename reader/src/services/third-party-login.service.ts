import {ReplaySubject} from "rxjs";
import axios from 'axios';

export interface ThirdPartyLoginSettingsDto {
    settings: ThirdPartyLoginSetting[];
}
export type ThirdPartyLoginSetting  = GoogleThirdPartySettings;

export interface GoogleThirdPartySettings {
    thirdPartyName: 'google';
    clientId: string;
}
/*
export interface TwitterThirdPartySettings {
    thirdPartyName: 'twitter';
    consumerKey:
}
*/
export class ThirdPartyLoginService {
    thirdPartyLogins$ = new ReplaySubject<ThirdPartyLoginSettingsDto>(1)
    constructor() {
        this.fetchThirdPartyLogins();
    }
    private async fetchThirdPartyLogins() {
        const response = await axios.get(`${process.env.PUBLIC_URL}/auth/third-party-logins`)
        debugger;
        this.thirdPartyLogins$.next(response.data);
    }
    public static async loginWith(thirdPartyLoginSetting: ThirdPartyLoginSetting) {

    }
}
