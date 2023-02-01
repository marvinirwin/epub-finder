import {LanguageConfigsService} from "../language/language-configs.service";
import {createLoadingObservable} from "../util/create-loading-observable";
import {distinctUntilChanged} from "rxjs/operators";
import {LoadingObservable} from "../../components/quiz/word-card.interface";
import {getCedict} from "../language/all-words.repository";
import { parseCedictDictionary } from "@shared/";

export type LanguageDict = {
    getDefinition(term: string): Promise<string>
}

export type LtDictionary = { getDefinition: (term: string) => Promise<string>, name: string };

export class DictionaryService {
    dictionary: LoadingObservable<LtDictionary>;
    constructor({
        languageConfigsService
                }: {
        languageConfigsService: LanguageConfigsService
    }) {
        this.dictionary = createLoadingObservable(
            languageConfigsService.readingLanguageCode$.pipe(distinctUntilChanged()),
            async (code) => {
                switch(code) {
                    case "zh-Hans":
                    case "zh-Hant":
                        const response = await getCedict();
                        const dictionary = parseCedictDictionary(response.data);
                        return {
                            getDefinition: async (term: string) => {
                                return (dictionary.get(term) || '').replace(/\[.*?\]/, "")
                            },
                            name: 'cedict_ts chinese dictionary'
                        }
                    default:
                        return  {
                            getDefinition: async (term: string) => "",
                            name: "No dictionary found for current language"
                        }
                }
            }
        )
    }
}

