import axios from 'axios'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { LanguageConfigsService } from './language-configs.service'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { createLoadingObservable } from '../util/create-loading-observable'
import memoize from "memoizee";
import {triggerAsyncId} from "async_hooks";

export const getCedict = memoize(() => axios.get(`${process.env.PUBLIC_URL}/cedict_ts.u8`))
export const ccEdictRegex = /([\p{Script_Extensions=Han}\d]+) ([\p{Script_Extensions=Han}\d]+) (.*?)$/gmu;

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
                        const allWords = new Set<string>();
                        response.data
                            .split('\n')
                            .forEach((line: string) => {
                                const result = ccEdictRegex.exec(line) || [];
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
