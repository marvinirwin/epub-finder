import {chunk} from "lodash"

export interface SpeechToTextConfig {
    label: string;
    code: string;
}

let speechToTextConfigs = chunk([
        'Arabic (Bahrain)', `ar-BH`,
        "Arabic (Egypt)", `ar-EG`,
        "Arabic (Iraq)", `ar-IQ`,
        "Arabic (Israel)", `ar-IL`,
        "Arabic (Jordan)", `ar-JO`,
        "Arabic (Kuwait)", `ar-KW`,
        "Arabic (Lebanon)", `ar-LB`,
        "Arabic (Oman)", `ar-OM`,
        "Arabic (Qatar)", `ar-QA`,
        "Arabic (Saudi Arabia)", `ar-SA`,
        "Arabic (State of Palestine)", `ar-PS`,
        "Arabic (Syria)", `ar-SY`,
        "Arabic (United Arab Emirates)", `ar-AE`,
        "Bulgarian (Bulgaria)", `bg-BG`,
        "Catalan (Spain)", `ca-ES`,
        "Chinese (Cantonese, Traditional)", `zh-HK`,
        "Chinese (Mandarin, Simplified)", `zh-CN`,
        "Chinese (Taiwanese Mandarin)", `zh-TW`,
        "Croatian (Croatia)", `hr-HR`,
        "Czech (Czech Republic)", `cs-CZ`,
        "Danish (Denmark)", `da-DK`,
        "Dutch (Netherlands)", `nl-NL`,
        "English (Australia)", `en-AU`,
        "English (Canada)", `en-CA`,
        "English (Hong Kong)", `en-HK`,
        "English (India)", `en-IN`,
        "English (Ireland)", `en-IE`,
        "English (New Zealand)", `en-NZ`,
        "English (Nigeria)", `en-NG`,
        "English (Philippines)", `en-PH`,
        'English (Singapore)', `en-SG`,
        "English (South Africa)", `en-ZA`,
        "English (United Kingdom)", `en-GB`,
        "English (United States)", `en-US`,
        "Estonian(Estonia)", `et-EE`,
        "Finnish (Finland)", `fi-FI`,
        "French (Canada)", `fr-CA`,
        "French (France)", `fr-FR`,
        "German (Germany)", `de-DE`,
        "Greek (Greece)", `el-GR`,
        "Gujarati (Indian)", `gu-IN`,
        "Hindi (India)", `hi-IN`,
        "Hungarian (Hungary)", `hu-HU`,
        "Irish(Ireland)", `ga-IE`,
        "Italian (Italy)", `it-IT`,
        "Japanese (Japan)", `ja-JP`,
        "Korean (Korea)", `ko-KR`,
        "Latvian (Latvia)", `lv-LV`,
        "Lithuanian (Lithuania)", `lt-LT`,
        "Maltese(Malta)", `mt-MT`,
        "Marathi (India)", `mr-IN`,
        "Norwegian (Bokmål, Norway)", `nb-NO`,
        "Polish (Poland)", `pl-PL`,
        "Portuguese (Brazil)", `pt-BR`,
        "Portuguese (Portugal)", `pt-PT`,
        "Romanian (Romania)", `ro-RO`,
        "Russian (Russia)", `ru-RU`,
        "Slovak (Slovakia)", `sk-SK`,
        "Slovenian (Slovenia)", `sl-SI`,
        "Spanish (Argentina)", `es-AR`,
        "Spanish (Bolivia)", `es-BO`,
        "Spanish (Chile)", `es-CL`,
        "Spanish (Colombia)", `es-CO`,
        "Spanish (Costa Rica)", `es-CR`,
        "Spanish (Cuba)", `es-CU`,
        "Spanish (Dominican Republic)", `es-DO`,
        "Spanish (Ecuador)", `es-EC`,
        "Spanish (El Salvador)", `es-SV`,
        "Spanish (Equatorial Guinea)", `es-GQ`,
        "Spanish (Guatemala)", `es-GT`,
        "Spanish (Honduras)", `es-HN`,
        "Spanish (Mexico)", `es-MX`,
        "Spanish (Nicaragua)", `es-NI`,
        "Spanish (Panama)", `es-PA`,
        "Spanish (Paraguay)", `es-PY`,
        "Spanish (Peru)", `es-PE`,
        "Spanish (Puerto Rico)", `es-PR`,
        "Spanish (Spain)", `es-ES`,
        "Spanish (Uruguay)", `es-UY`,
        "Spanish (USA)", `es-US`,
        "Spanish (Venezuela)", `es-VE`,
        "Swedish (Sweden)", `sv-SE`,
        "Tamil (India)", `ta-IN`,
        "Telugu (India)", `te-IN`,
        "Thai (Thailand)", `th-TH`,
        "Turkish (Turkey)", `tr-TR`,
], 2).map(([label, id]) => ({label, code: id}));

export class SupportedSpeechToTextService {
    public static Configs: SpeechToTextConfig[] = speechToTextConfigs
    public static ConfigMap = new Map<string, SpeechToTextConfig>(
        speechToTextConfigs.map(c => [c.code, c])
    )
}
