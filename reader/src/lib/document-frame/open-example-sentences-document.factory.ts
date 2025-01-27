import { Observable } from 'rxjs'

import { InterpolateExampleSegmentsService } from '../../components/example-sentences/interpolate-example-sentences.service'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { DocumentSourcesService } from './document-sources.service'
import { OpenDocument } from './open-document.entity'
import { SettingsService } from '../../services/settings.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'
import { OnSelectService } from '../user-interface/on-select.service'
import {SegmentSubsequences} from "@shared/*";
import {ExampleSegmentsService} from "../quiz/example-segments.service";
import {LoadingService} from "../loading/loadingService";

export const OpenExampleSentencesFactory = ({
    documentId,
    sentences$,
    tabulationConfigurationService,
    settingsService,
    languageConfigsService,
    onSelectService,
    exampleSegmentsService,
    loadingService
}: {
    documentId: string
    sentences$: Observable<SegmentSubsequences[]>
    tabulationConfigurationService: TabulationConfigurationService
    settingsService: SettingsService
    languageConfigsService: LanguageConfigsService
    onSelectService: OnSelectService
    exampleSegmentsService: ExampleSegmentsService
    loadingService: LoadingService
}) => {
    return new OpenDocument(
        documentId,
        tabulationConfigurationService,
        DocumentSourcesService.document({
            unAtomizedDocument$: sentences$.pipe(
                map(subSequences => InterpolateExampleSegmentsService.interpolate(subSequences.map(({segmentText}) => segmentText))),
                distinctUntilChanged(),
                shareReplay(1),
            ),
            documentId
        }),
        'Example Sentences',
        {
            settingsService,
            languageConfigsService,
            onSelectService,
            exampleSegmentsService,
            loadingService
        },
    )
}
