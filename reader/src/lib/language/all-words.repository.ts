import axios from 'axios'
import { combineLatest, Observable } from 'rxjs'
import { LanguageConfigsService } from './language-configs.service'
import { map, shareReplay } from 'rxjs/operators'
import { createLoadingObservable } from '../util/create-loading-observable'
import memoize from "memoizee";
import {cEdictRegex} from "@shared/";
import {getApiUrl} from '../util/getApiUrl'

export const getCedict = memoize(() => axios.get(getApiUrl("/cedict_ts.u8")))

export class AllWordsRepository {
    all$: Observable<Set<string>>

    constructor(
        {
            languageConfigsService
        }:
            {
                languageConfigsService: LanguageConfigsService
            },
    ) {
        const {isLoading$, obs$} = createLoadingObservable(
            languageConfigsService.readingLanguageCode$,
            async code => {
                switch(code) {
                    case 'zh-Hans':
                        const response = await getCedict();
                        const data = response.data;
                        const allWords = new Set<string>();
                        data
                            .split('\n')
                            .forEach((line: string) => {
                                const result = cEdictRegex.exec(line) || [];
                                const traditional = result[1];
                                const simplified = result[2];
                                if ((!traditional || !simplified)) {
                                    if (result.length) {
                                        debugger;console.log();
                                    }
                                    return
                                }
                                allWords.add(traditional);
                                allWords.add(simplified);
                            })
                        return allWords;
                    default:
                        return new Set<string>();
                }
            }
        )
        this.all$ = combineLatest([
            isLoading$,
            obs$,
        ]).pipe(
            map(([loading, wordSet]) => loading ? new Set<string>() : wordSet),
            shareReplay(1)
        )
    }
}
