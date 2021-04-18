import axios from 'axios'
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'
import { LanguageConfigsService } from './language-configs.service'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { createLoadingObservable } from '../util/create-loading-observable'

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
                        const response = await axios
                            .get(`${process.env.PUBLIC_URL}/all_chinese_words.csv`);
                        const allWords = response.data
                            .split('\n')
                            .map((word: string) => word.trim())
                        return new Set<string>(allWords)
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
