import {
    SerializableTabulationConfiguration,
} from '../../../../../server/src/shared/tabulation/tabulate'
import { combineLatest, Observable } from 'rxjs'
import { WordsService } from '../words.service'
import { NotableSubsequencesService } from '../../sentences/notable-subsequences.service'
import { LanguageConfigsService } from '../language-configs.service'
import { map, shareReplay } from 'rxjs/operators'

export class TabulationConfigurationService {
    tabulationConfiguration$: Observable<SerializableTabulationConfiguration>

    constructor({
        wordsService,
        notableSubsequencesService,
        languageConfigsService,
    }: {
        wordsService: WordsService
        notableSubsequencesService: NotableSubsequencesService
        languageConfigsService: LanguageConfigsService
    }) {
        this.tabulationConfiguration$ = combineLatest([
            wordsService.words$,
            notableSubsequencesService.notableSubsequenceSet$,
            languageConfigsService.readingLanguageCode$,
        ]).pipe(
            map(([wordSet, notableSubsequenceSet, language_code]) => {
                return {
                    notableCharacterSequences: notableSubsequenceSet,
                    greedyWordSet: wordSet,
                    language_code,
                }
            }),
            shareReplay(1),
        )
    }
}
