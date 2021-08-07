import {LanguageConfigsService} from "../language/language-configs.service";
import {createLoadingObservable} from "../util/create-loading-observable";
import {distinctUntilChanged} from "rxjs/operators";
import axios from "axios";
import {LoadingObservable} from "../../components/quiz/word-card.interface";
import {ccEdictRegex, getCedict} from "../language/all-words.repository";

export type LanguageDict = {
    getDefinition(): Promise<string>
}

export class DictionaryService {
    private $dictionary: LoadingObservable<{ getDefinition: (term: string) => Promise<string> }>;
    constructor({
        languageConfigsService
                }: {
        languageConfigsService: LanguageConfigsService
    }) {
        this.$dictionary = createLoadingObservable(
            languageConfigsService.readingLanguageCode$.pipe(distinctUntilChanged()),
            async (code) => {
                switch(code) {
                    case "zh-Hans":
                    case "zh-Hant":
                        const response = await getCedict();
                        const dictionary = new Map<string, string>();
                        response.data
                            .split('\n')
                            .forEach((line: string) => {
                                const [traditional, simplified, definition] = ccEdictRegex.exec(line) || [];
                                dictionary.set(traditional, definition);
                                dictionary.set(simplified, definition);
                            });
                        return {
                            getDefinition: async (term: string) => {
                                return dictionary.get(term) || ''
                            }
                        }
                    default:
                        return  {
                            getDefinition: async (term: string) => ""
                        }
                }
            }
        )
    }
}