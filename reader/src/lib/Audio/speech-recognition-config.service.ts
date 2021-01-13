import {SpeechConfig} from "microsoft-cognitiveservices-speech-sdk";
import axios from "axios";
import jwt_decode from "jwt-decode";
import {RefreshableService} from "./refreshable.service";


// Load when no token found

const AZURE_SPEECH_REGION = 'westus2' as string;

export class SpeechRecognitionConfigService {
    public config: RefreshableService<SpeechConfig>;

    constructor() {
        this.config = new RefreshableService<SpeechConfig>(
            config => {
                const {exp} = jwt_decode(config.authorizationToken) as { exp: number };
                if (exp > (new Date().getTime() / 1000)) {
                    return true;
                }
                return false
            },
            async () => {
                return SpeechConfig.fromAuthorizationToken(
                    await SpeechRecognitionConfigService.loadToken(),
                    AZURE_SPEECH_REGION
                );
            }
        )
    }

    private static async loadToken() {
        return axios
            .post(`${process.env.PUBLIC_URL}/speech-recognition-token`)
            .then(result =>
                result.data
            );
    }
}