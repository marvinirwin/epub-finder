import {combineLatest, Observable, of} from 'rxjs'
import CardsRepository from '../../lib/manager/cards.repository'
import {ICard} from "@shared/"
import {LanguageConfigsService} from '../../lib/language/language-configs.service'
import {EditableValue} from './editing-value'
import {resolveICardForWordLatest} from '../../lib/pipes/ResolveICardForWord'
import {debounceTime, distinctUntilChanged, map, shareReplay, withLatestFrom} from 'rxjs/operators'
import {fetchTransliteration} from '../../lib/language/transliterate.service'
import {fetchTranslationWithGrammarHints} from '../../services/translate.service'
import {fetchSynthesizedAudio} from '../../lib/audio/fetch-synthesized-audio'
import {WordCard} from './word-card.interface'
import {createLoadingObservable} from '../../lib/util/create-loading-observable'
import {DictionaryService} from "../../lib/dictionary/dictionary.service";

export const wordCardFactory = (
    currentWord$: Observable<string | undefined>,
    cardService: CardsRepository,
    languageConfigsService: LanguageConfigsService,
    dictionaryService: DictionaryService
): WordCard => {
    const update = (propsToUpdate: Partial<ICard>, word: string) => {
        cardService.updateICard(word, propsToUpdate)
    }

    return {
        word$: currentWord$,
        image$: new EditableValue<string | undefined>(
            resolveICardForWordLatest(
                cardService.cardIndex$,
                currentWord$,
                languageConfigsService.readingLanguageCode$
            ).pipe(
                distinctUntilChanged(),
                map((c) => {
                    return c?.photos?.[0]
                }),
                shareReplay(1),
            ),
            (imageSrc$) => {
                imageSrc$
                    .pipe(withLatestFrom(currentWord$), debounceTime(1000))
                    .subscribe(([imageSrc, word]) => {
                            const newPhotos = [];
                            if (imageSrc) {
                                newPhotos.push(imageSrc);
                            }
                            update({photos: newPhotos}, word || '')
                        },
                    )
            },
        ),
        description$: new EditableValue<string | undefined>(
            resolveICardForWordLatest(
                cardService.cardIndex$,
                currentWord$,
                languageConfigsService.readingLanguageCode$
            ).pipe(
                map((c) => c?.known_language?.[0]),
                shareReplay(1),
            ),
            (description$) =>
                description$
                    .pipe(withLatestFrom(currentWord$), debounceTime(1000))
                    .subscribe(([description, word]) => {
                        update(
                            {known_language: [description || '']},
                            word || '',
                        )
                    }),
        ),
        romanization$: createLoadingObservable(combineLatest([
                languageConfigsService.learningToLatinTransliterateFn$,
                currentWord$,
            ]),
            ([transliterateConfig, currentWord]) =>
                transliterateConfig
                    ? fetchTransliteration({
                        ...transliterateConfig,
                        text: currentWord || '',
                    })
                    : of(undefined)),
        translation$: createLoadingObservable(combineLatest([
                languageConfigsService.learningToKnownTranslateConfig$,
                dictionaryService.dictionary.obs$,
                currentWord$,
            ]),  ([translateConfig, dictionary, currentWord]) => {
                return dictionary.getDefinition(currentWord || "")
                    .then(result => {
                        if (result) {
                            return result;
                        }
                        return translateConfig
                            ? fetchTranslationWithGrammarHints({
                                text: currentWord || '',
                                ...translateConfig,
                            })
                            : ""
                    });
            },
        ),
        audio$: createLoadingObservable(combineLatest([currentWord$, languageConfigsService.learningLanguageTextToSpeechConfig$]),
            async ([currentWord, learningLanguageToTextConfig]) => {
                if (currentWord && learningLanguageToTextConfig) {
                    return fetchSynthesizedAudio({...learningLanguageToTextConfig, text: currentWord})
                }
            },
        ),
    }
}
