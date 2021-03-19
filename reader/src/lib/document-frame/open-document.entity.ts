import {combineLatest, Observable, ReplaySubject} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {
    annotatedAndTranslated,
    AtomizedDocument,
    Segment, SerializedDocumentTabulation,
    SerializedTabulation,
    TabulatedDocuments,
    tabulatedSentenceToTabulatedDocuments
} from "@shared/";
import {TabulateLocalDocument} from "../Workers/worker.helpers";
import {mergeTabulations} from "../merge-tabulations";
import {XMLDocumentNode} from "../../../../server/src/shared/XMLDocumentNode";
import {BrowserSegment} from "../browser-segment";
import {SettingsService} from "../../services/settings.service";
import {LanguageConfigsService} from "../language-configs.service";
import {isLoading} from "../util/is-loading";
import {TabulationConfigurationService} from "../tabulation-configuration.service";

export class OpenDocument {
    public name: string;
    public renderedSegments$ = new ReplaySubject<BrowserSegment[]>(1)
    public renderedTabulation$: Observable<TabulatedDocuments>;
    public virtualTabulation$: Observable<SerializedDocumentTabulation>;
    public renderRoot$ = new ReplaySubject<HTMLBodyElement>(1);
    public isLoadingVirtualTabulation$: Observable<boolean>;

    constructor(
        public id: string,
        public tabulationConfigurationService: TabulationConfigurationService,
        public atomizedDocument$: Observable<AtomizedDocument>,
        public label: string,
        public settingsService: SettingsService,
        public languageConfigsService: LanguageConfigsService
    ) {
        this.name = id;
        this.renderedSegments$.next([]);
        this.renderedTabulation$ = combineLatest([
            this.renderedSegments$,
            tabulationConfigurationService.tabulationConfiguration$,
        ]).pipe(
            map(([segments, tabulationConfiguration]) => {
                    const tabulatedSentences = mergeTabulations(Segment.tabulate(
                        {
                            ...tabulationConfiguration,
                            segments,
                        },
                    ));
                    return tabulatedSentenceToTabulatedDocuments({
                            tabulatedSentences,
                            label: this.label,
                            id: this.id
                        }
                    );
                }
            ),
            shareReplay(1),
        );
        const {isLoading$, obs$} = isLoading(
            combineLatest([
                this.tabulationConfigurationService.tabulationConfiguration$,
                this.atomizedDocument$
            ]),
            ([tabulationConfiguration, document]) => {
                return TabulateLocalDocument({
                    label,
                    notableSubsequences: [...tabulationConfiguration.notableCharacterSequences.values()],
                    words: [...tabulationConfiguration.greedyWordSet.values()],
                    src: document._originalSrc,
                    id: this.id
                })
            },
        );
        this.virtualTabulation$ = obs$;
        this.isLoadingVirtualTabulation$ = isLoading$;
    }

    async handleHTMLHasBeenRendered(
        head: HTMLHeadElement,
        body: HTMLDivElement,
    ) {
        const segments = [...(body.ownerDocument as HTMLDocument).getElementsByClassName(annotatedAndTranslated)]
            .map(element => {
                return new BrowserSegment({
                    element: element as unknown as XMLDocumentNode,
                    languageConfigsService: this.languageConfigsService,
                    settingsService: this.settingsService
                });
            });
        this.renderRoot$.next((body.ownerDocument as HTMLDocument).body as HTMLBodyElement);
        this.renderedSegments$.next(segments);
    }
}

