import {Observable} from "rxjs";

import {TrieWrapper} from "../TrieWrapper";
import {InterpolateExampleSentencesService} from "../../components/example-sentences/interpolate-example-sentences.service";
import {distinctUntilChanged, map, shareReplay} from "rxjs/operators";
import {DocumentSourcesService} from "./document-sources.service";
import {OpenDocument} from "./open-document.entity";
import {SettingsService} from "../../services/settings.service";
import {LanguageConfigsService} from "../language-configs.service";
import {TabulationConfigurationService} from "../tabulation-configuration.service";


export const OpenExampleSentencesFactory = (
    {
        name,
        sentences$,
        tabulationConfigurationService,
        settingsService,
        languageConfigsService
    }: {
        name: string,
        sentences$: Observable<string[]>,
        tabulationConfigurationService: TabulationConfigurationService
        settingsService: SettingsService,
        languageConfigsService: LanguageConfigsService
    }
) => {
    return new OpenDocument(
        name,
        tabulationConfigurationService,
        DocumentSourcesService
            .document({
                unAtomizedDocument$: sentences$
                    .pipe(
                        map(InterpolateExampleSentencesService.interpolate),
                        distinctUntilChanged(),
                        shareReplay(1)
                    )
            }),
        'Example Sentences',
        settingsService,
        languageConfigsService
    );
}
