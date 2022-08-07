import { combineLatest, Observable, ReplaySubject } from 'rxjs'
import {flatMap, map, shareReplay, switchMap} from 'rxjs/operators'
import {
    annotatedAndTranslated,
    AtomizedDocument,
    SerializedDocumentTabulation,
    tabulate,
    TabulatedSegments,
} from '@shared/'
import { TabulateLocalDocument } from '../workers/worker.helpers'
import { XMLDocumentNode } from "@shared/"
import { BrowserSegment } from '../sentences/browser-segment'
import { SettingsService } from '../../services/settings.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { createLoadingObservable } from '../util/create-loading-observable'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'
import { OnSelectService } from '../user-interface/on-select.service'
import { resolvePartialTabulationConfig } from "@shared/"
import { pipeLog } from '../manager/pipe.log'
import {ExampleSegmentsService} from "../quiz/example-segments.service";
import { AbstractSegment } from "@shared/"

export class OpenDocument {
    public name: string
    public renderedSegments$ = new ReplaySubject<BrowserSegment[]>(1)
    public renderedTabulation$: Observable<TabulatedSegments<XMLDocumentNode, AbstractSegment<XMLDocumentNode>>>
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
            exampleSegmentsService: ExampleSegmentsService
        },
    ) {
        this.name = id
        this.renderedSegments$.next([])
        this.renderedTabulation$ = combineLatest([
            this.renderedSegments$,
            tabulationConfigurationService.tabulationConfiguration$,
            services.languageConfigsService.readingLanguageCode$,
        ]).pipe(
            switchMap(([segments, tabulationConfiguration, language_code]) => {
                return tabulate<XMLDocumentNode, AbstractSegment<XMLDocumentNode>>({
                    segments,
                    ...tabulationConfiguration,
                    ...resolvePartialTabulationConfig(language_code),
                })
            }),
            shareReplay(1),
        )
        const { isLoading$: isLoadingVirtualTabulation$, obs$: virtualTabulation$ } = createLoadingObservable(
            combineLatest([
                this.tabulationConfigurationService.tabulationConfiguration$.pipe(pipeLog('open-document:tabulation-configuration')),
                this.atomizedDocument$.pipe(pipeLog('open-document:atomized-document')),
            ]).pipe(pipeLog("open-document:virtual-tabulation-combine-latest")),
            ([tabulationConfiguration, document]) => {
                return TabulateLocalDocument({
                    label,
                    notableSubsequences: [
                        ...tabulationConfiguration.notableCharacterSequences.values(),
                    ],
                    words: [...tabulationConfiguration.greedyWordSet.values()],
                    src: document._originalSrc,
                    id: this.id,
                    language_code: tabulationConfiguration.language_code,
                })
            },
        )
        // This might be the source of the 4x processing
        this.virtualTabulation$ = virtualTabulation$.pipe(pipeLog("open-document:virtual-tabulation-loading"))
        this.isLoadingVirtualTabulation$ = isLoadingVirtualTabulation$;
    }

    async handleHTMLHasBeenRendered(
        body: HTMLDivElement,
    ) {
        const segments = [
            ...body.getElementsByClassName(
                annotatedAndTranslated,
            ),
        ].map((element) => {
            return new BrowserSegment({
                element: (element as unknown) as XMLDocumentNode,
                languageConfigsService: this.services.languageConfigsService,
                settingsService: this.services.settingsService,
                exampleSegmentsService: this.services.exampleSegmentsService
            })
        })
        this.services.onSelectService.handleSelection(body.ownerDocument)
        this.renderRoot$.next(
            (body.ownerDocument as HTMLDocument).body as HTMLBodyElement,
        )
        this.renderedSegments$.next(segments)
    }
}
