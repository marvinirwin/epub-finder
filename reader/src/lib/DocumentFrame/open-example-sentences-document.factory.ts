import {Observable} from "rxjs";

import {TrieWrapper} from "../TrieWrapper";
import {InterpolateExampleSentencesService} from "../../components/example-sentences/interpolate-example-sentences.service";
import {distinctUntilChanged, map, shareReplay} from "rxjs/operators";
import {DocumentSourcesService} from "./document-sources.service";
import {OpenDocument} from "./open-document.entity";


export const OpenExampleSentencesFactory = (
    name: string,
    sentences$: Observable<string[]>,
    trie$: Observable<TrieWrapper>,
) => {
    return new OpenDocument(
        name,
        trie$,
        DocumentSourcesService
            .document({
                unAtomizedDocument$: sentences$
                    .pipe(
                        map(InterpolateExampleSentencesService.interpolate),
                        distinctUntilChanged(),
                        shareReplay(1)
                    )
            }),
        'Example Sentences'
    );
}
