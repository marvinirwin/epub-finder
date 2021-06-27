import { Observable } from 'rxjs'

import { TrieWrapper } from '../util/TrieWrapper'
import { InterpolateExampleSentencesService } from '../../components/example-sentences/interpolate-example-sentences.service'
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators'
import { DocumentSourcesService } from './document-sources.service'
import { OpenDocument } from './open-document.entity'
import { SettingsService } from '../../services/settings.service'
import { LanguageConfigsService } from '../language/language-configs.service'
import { TabulationConfigurationService } from '../language/language-maps/tabulation-configuration.service'
import { OnSelectService } from '../user-interface/on-select.service'
import {IPositionedWord} from "../../../../server/src/shared/Annotation/IPositionedWord";
import {getGreedySubSequences} from "../schedule/learning-target/get-greedy-subsequences";
import {SegmentSubsequences} from "@shared/*";

export const OpenExampleSentencesFactory = ({
    name,
    sentences$,
    tabulationConfigurationService,
    settingsService,
    languageConfigsService,
    onSelectService,
}: {
    name: string
    sentences$: Observable<SegmentSubsequences[]>
    tabulationConfigurationService: TabulationConfigurationService
    settingsService: SettingsService
    languageConfigsService: LanguageConfigsService
    onSelectService: OnSelectService
}) => {
    return new OpenDocument(
        name,
        tabulationConfigurationService,
        DocumentSourcesService.document({
            unAtomizedDocument$: sentences$.pipe(
                map(subSequences => InterpolateExampleSentencesService.interpolate(subSequences.map(({segmentText}) => segmentText))),
                distinctUntilChanged(),
                shareReplay(1),
            ),
        }),
        'Example Sentences',
        {
            settingsService,
            languageConfigsService,
            onSelectService,
        },
    )
}
