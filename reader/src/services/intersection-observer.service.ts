import {ReplaySubject, Observable, combineLatest} from "rxjs";
import {AtomizedSentenceService} from "./atomized-sentence.service";
import {debounceTime, withLatestFrom} from "rxjs/operators";

export class IntersectionObserverService {
    public observer: IntersectionObserver;
    public newAtomizedSentenceVisible$ = new ReplaySubject<Element>(1);
    public newAtomizedSentenceHidden$ = new ReplaySubject<Element>(1);

    constructor({
                    atomizedSentenceService
                }: {
        atomizedSentenceService: AtomizedSentenceService
    }) {
        const intersectionObserverEntries$ = new ReplaySubject<IntersectionObserverEntry[]>(1);
        atomizedSentenceService.elementSentenceMap$.subscribe()
        this.observer = new IntersectionObserver(
            intersectionObserverEntries => intersectionObserverEntries$
                .next(intersectionObserverEntries),
            {}
        );

        combineLatest([
            intersectionObserverEntries$,
            atomizedSentenceService.elementSentenceMap$
        ]).subscribe(([
                          items,
                          sentenceMap
                      ]) =>
            items.forEach(item => {
                    const sentence = sentenceMap.get(item.target);
                    if (sentence) {
                        item.isIntersecting ?
                            this.newAtomizedSentenceVisible$.next(item.target) :
                            this.newAtomizedSentenceHidden$.next(item.target);
                    }
                }
            )
        )
    }
}