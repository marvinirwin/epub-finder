import {combineLatest, Observable, of} from "rxjs";
import CardsRepository from "../../lib/manager/cards.repository";
import {ICard} from "../../../../server/src/shared/ICard";
import {LanguageConfigsService} from "../../lib/language-configs.service";
import {EditableValue} from "./editing-value";
import {resolveICardForWordLatest} from "../../lib/pipes/ResolveICardForWord";
import {debounceTime, distinctUntilChanged, map, shareReplay, switchMap, withLatestFrom} from "rxjs/operators";

export const wordCardFactory = (
    currentWord$: Observable<string | undefined>,
    cardService: CardsRepository,
    languageConfigsService: LanguageConfigsService
) => {
    function update(propsToUpdate: Partial<ICard>, word: string) {
        cardService.updateICard(
            word,
            propsToUpdate
        )
    }
    return ({
        word$: currentWord$,
        image$: new EditableValue<string | undefined>(
            resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                .pipe(
                    distinctUntilChanged(),
                    map(c => {
                        return c?.photos?.[0];
                    }),
                    shareReplay(1),
                ),
            imageSrc$ => imageSrc$
                .pipe(
                    withLatestFrom(currentWord$),
                    debounceTime(1000),
                ).subscribe(([imageSrc, word]) => update({photos: [imageSrc || '']}, word || ''))
        ),
        description$: new EditableValue<string | undefined>(
            resolveICardForWordLatest(cardService.cardIndex$, currentWord$)
                .pipe(
                    map(c => c?.knownLanguage?.[0]),
                    shareReplay(1)
                ),
            description$ =>
                description$.pipe(
                    withLatestFrom(currentWord$),
                    debounceTime(1000)
                ).subscribe(([description, word]) => {
                    update({knownLanguage: [description || '']}, word || '')
                })
        ),
        romanization$: combineLatest([
            languageConfigsService.learningToLatinTransliterateFn$,
            currentWord$
        ]).pipe(
            switchMap((
                [transliterateFn, currentWord]
            ) => transliterateFn ? transliterateFn(currentWord || '') : of(undefined)),
            shareReplay(1)
        ),
        translation$: combineLatest([
            languageConfigsService.learningToKnownTranslateFn$,
            currentWord$
        ]).pipe(
            switchMap(
                ([translateFn, currentWord]) =>
                    translateFn ? translateFn(currentWord || '') : of(undefined)
            ),
            shareReplay(1)
        ),
        // I should make "hidden" deterministic somehow
        // I'll worry about that later
    });
};