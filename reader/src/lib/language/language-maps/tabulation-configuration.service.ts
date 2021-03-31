import {
    SerializableTabulationConfiguration,
    TabulationConfiguration,
    TabulationParameters
} from "../../../../../server/src/shared/tabulation/tabulate";
import {combineLatest, Observable} from "rxjs";
import {WordsService} from "../words.service";
import {NotableSubsequencesService} from "../../sentences/notable-subsequences.service";
import {LanguageConfigsService} from "../language-configs.service";
import {SetWithUniqueLengths} from "../../../../../server/src/shared/tabulate-documents/set-with-unique-lengths";
import {Segment} from "@shared/*";
import {map, shareReplay} from "rxjs/operators";

export class TabulationConfigurationService {
    tabulationConfiguration$: Observable<SerializableTabulationConfiguration>
    languageCode$: Observable<string>;

    constructor(
        {
            wordsService,
            notableSubsequencesService,
            languageConfigsService,
        }: {
            wordsService: WordsService
            notableSubsequencesService: NotableSubsequencesService,
            languageConfigsService: LanguageConfigsService
        }
    ) {
        this.languageCode$ = languageConfigsService.learningToKnownTranslateConfig$.pipe(
            map(translationConfig => translationConfig?.from || 'en')
        )
        this.tabulationConfiguration$ = combineLatest(
            [
                wordsService.words$,
                notableSubsequencesService.notableSubsequenceSet$,
                this.languageCode$
            ]
        ).pipe(
            map(([
                     wordSet,
                     notableSubsequenceSet,
                     languageCode
                 ]) => {
                return {
                    notableCharacterSequences: notableSubsequenceSet,
                    greedyWordSet: wordSet,
                    languageCode
                }
            }),
            shareReplay(1)
        )
    }
}