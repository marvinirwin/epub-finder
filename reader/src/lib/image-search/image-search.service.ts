import { Observable, ReplaySubject } from 'rxjs'
import { getImages, ImageSearchResult } from '../../services/image-search.service'
import { createLoadingObservable } from '../util/create-loading-observable'
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators'
import { LoadingObservable } from '../../components/quiz/word-card.interface'

export class ImageSearchService {
    public queryImageRequest$: ReplaySubject< string > = new ReplaySubject<string>(1);
    public queryImageCallback$ = new ReplaySubject<(v: string) => unknown>(1);
    results$: LoadingObservable<ImageSearchResult>
    constructor() {
        this.results$ = createLoadingObservable(
            this.queryImageRequest$
                .pipe(
                    filter(r => !!r),
                    debounceTime(1000),
                    distinctUntilChanged()
                ),
            (v) => getImages(v)
        );
    }
}
