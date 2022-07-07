import {
    SerializableTabulationConfiguration,
} from "languagetrainer-server/src/shared"
import { combineLatest, Observable } from 'rxjs'
import { WordsService } from '../words.service'
import { NotableSubsequencesService } from '../../sentences/notable-subsequences.service'
import { LanguageConfigsService } from '../language-configs.service'
import { map, shareReplay } from 'rxjs/operators'
import { pipeLog } from '../../manager/pipe.log'

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
            wordsService.words$.pipe(pipeLog("tabulation-configuration:words")),
            notableSubsequencesService.notableSubsequenceSet$.pipe(pipeLog("tabulation-configuration: notable-subsequences")),
            languageConfigsService.readingLanguageCode$.pipe(pipeLog("tabulation-configuration:reading-language-codes")),
        ]).pipe(
            pipeLog("tabulation-configuration:combineLatest"),
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
