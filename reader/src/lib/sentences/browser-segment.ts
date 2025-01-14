import { Segment } from '@shared/'
import { XMLDocumentNode } from "@shared/"
import { combineLatest, Observable, of } from 'rxjs'
import { LanguageConfigsService } from '../language/language-configs.service'
import { SettingsService } from '../../services/settings.service'
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators'
import { fetchTranslationWithGrammarHints } from '../../services/translate.service'
import { fetchTransliteration } from '../language/transliterate.service'
import {ExampleSegmentsService} from "../quiz/example-segments.service";
import { uniq } from 'lodash'

export class BrowserSegment extends Segment {
    translation$: Observable<string>
    romanization$: Observable<string>
    mouseoverText$: Observable<{ title: string; subtitle: string }>
    constructor({
        element,
        languageConfigsService,
        settingsService,
        exampleSegmentsService
    }: {
        element: XMLDocumentNode
        languageConfigsService: LanguageConfigsService
        settingsService: SettingsService
        exampleSegmentsService: ExampleSegmentsService
    }) {
        super(element)
        this.translation$ = languageConfigsService.learningToKnownTranslateConfig$.pipe(
            switchMap((translateConfig) =>
                translateConfig
                    ? fetchTranslationWithGrammarHints({
                          ...translateConfig,
                          text: this.translatableText,
                      })
                    : of(''),
            ),
            shareReplay(1),
        )
        this.romanization$ = languageConfigsService.learningToLatinTransliterateFn$.pipe(
            switchMap((romanizationConfig) =>
                romanizationConfig
                    ? fetchTransliteration({
                          ...romanizationConfig,
                          text: this.translatableText,
                      })
                    : of(''),
            ),
            shareReplay(1),
        )
        this.mouseoverText$ = combineLatest([
            this.translation$.pipe(startWith('')),
            this.romanization$.pipe(startWith('')),
            settingsService.showRomanization$.obs$,
            settingsService.showTranslation$.obs$,
            exampleSegmentsService.exampleSegmentTabulationMap$
        ]).pipe(
            map(
                ([
                    translation,
                    romanization,
                    showRomanization,
                    showTranslation,
                    exampleSegmentMap
                ]) => {
                    const sourceTabulations = exampleSegmentMap.get(this.translatableText);
                    const sourceTabulationLabels = sourceTabulations ? uniq(sourceTabulations.map(sourceTabulation => sourceTabulation.label)).join(', ') : '';
                    const titleText = showRomanization ? romanization || '' : '';
                    const translationWithSource = (sourceTabulationLabels && translation) ?
                        `${translation}

                        ${sourceTabulationLabels}
                        ` : translation;
                    const subtitle = showTranslation ? translationWithSource : '';
                    return {
                        title: showRomanization ? titleText || '' : '',
                        subtitle,
                    }
                },
            ),
            shareReplay(1),
        )
    }
}
