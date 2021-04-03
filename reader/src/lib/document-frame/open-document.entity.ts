import { combineLatest, Observable, ReplaySubject } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import {
    annotatedAndTranslated,
    AtomizedDocument,
    SerializedDocumentTabulation,
    tabulate,
    TabulatedDocuments, TabulatedSegments,
} from '@shared/'
import { TabulateLocalDocument } from '../Workers/worker.helpers'
import { XMLDocumentNode } from '../../../../server/src/shared/XMLDocumentNode'
import { BrowserSegment } from '../sentences/browser-segment'
import { SettingsService } from '../../services/settings.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { createLoadingObservable } from '../util/create-loading-observable'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'
import { OnSelectService } from '../user-interface/on-select.service'
import { resolvePartialTabulationConfig } from '../../../../server/src/shared/tabulation/word-separator'

export class OpenDocument {
    public name: string
    public renderedSegments$ = new ReplaySubject<BrowserSegment[]>(1)
    public renderedTabulation$: Observable<TabulatedSegments>
    public virtualTabulation$: Observable<SerializedDocumentTabulation>
    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1)
    public isLoadingVirtualTabulation$: Observable<boolean>

    constructor(
        public id: string,
        public tabulationConfigurationService: TabulationConfigurationService,
        public atomizedDocument$: Observable<AtomizedDocument>,
        public label: string,
        public services: {
            settingsService: SettingsService
            languageConfigsService: LanguageConfigsService
            onSelectService: OnSelectService
        },
    ) {
        this.name = id
        this.renderedSegments$.next([])
        this.renderedTabulation$ = combineLatest([
            this.renderedSegments$,
            tabulationConfigurationService.tabulationConfiguration$,
            services.languageConfigsService.readingLanguageCode$,
        ]).pipe(
            map(([segments, tabulationConfiguration, languageCode]) => {
                return tabulate({
                    segments,
                    ...tabulationConfiguration,
                    ...resolvePartialTabulationConfig(languageCode),
                })
            }),
            shareReplay(1),
        )
        const { isLoading$, obs$ } = createLoadingObservable(
            combineLatest([
                this.tabulationConfigurationService.tabulationConfiguration$,
                this.atomizedDocument$,
            ]),
            ([tabulationConfiguration, document]) => {
                return TabulateLocalDocument({
                    label,
                    notableSubsequences: [
                        ...tabulationConfiguration.notableCharacterSequences.values(),
                    ],
                    words: [...tabulationConfiguration.greedyWordSet.values()],
                    src: document._originalSrc,
                    id: this.id,
                    languageCode: tabulationConfiguration.languageCode,
                })
            },
        )
        this.virtualTabulation$ = obs$
        this.isLoadingVirtualTabulation$ = isLoading$
    }

    async handleHTMLHasBeenRendered(
        head: HTMLHeadElement,
        body: HTMLDivElement,
    ) {
        const segments = [
            ...(body.ownerDocument as HTMLDocument).getElementsByClassName(
                annotatedAndTranslated,
            ),
        ].map((element) => {
            return new BrowserSegment({
                element: (element as unknown) as XMLDocumentNode,
                languageConfigsService: this.services.languageConfigsService,
                settingsService: this.services.settingsService,
            })
        })
        this.services.onSelectService.handleSelection(body.ownerDocument)
        this.renderRoot$.next(
            (body.ownerDocument as HTMLDocument).body as HTMLBodyElement,
        )
        this.renderedSegments$.next(segments)
    }
}
