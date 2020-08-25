import {Run, UnitTestGetPageSrc} from "../Util/Run";
import {CausalTree} from "../Graph/CausalTree";
import {Website} from "../../lib/Website/Website";
import {getNewICardForWord, NavigationPages} from "../../lib/Util/Util";
import {EditingCard} from "../../lib/ReactiveClasses/EditingCard";

require('jest-localstorage-mock');
['unhandledRejection', 'uncaughtException'].forEach(event => {
    // @ts-ignore
    process.on(event, (err: any) => {
        console.error(err);
    });
});




it("Loads the manager without error", () => {
    Run((
        {
            manager,
            manager: {
                highlightedWord$,
                quizManager: {
                    scheduledCards$,
                    quizzingCard$
                },
                openedBooksManager: {
                    addOpenBook$
                },
                quizCharacterManager: {
                    exampleSentences$
                },
                editingCardManager: {
                    queEditingCard$,
                    editingCard$
                },
                cardManager: {
                    addUnpersistedCards$,
                    trie$
                },
                audioManager: {
                    audioRecorder: {
                        recordRequest$
                    }
                },
                bottomNavigationValue$,
                sourceBookSentenceData$
            },
            scheduler,
            helpers: {
                hot
            }
        }
    ) => {
        scheduler
            .expectOrderings(
                {
                    quizzingCard$,
                    scheduledCards$: scheduledCards$.obs$,
                    exampleSentences$: exampleSentences$.obs$,
                    recordRequest$,
                    bottomNavigationValue$,
                    sourceBookSentenceData$: sourceBookSentenceData$,
                    addOpenBook$,
                },
                CausalTree.init(`
                                         
                                        quizPageWordElements
                                        ^
                                        bottomNavigationValue$.next(QUIZ_PAGE)
                                        ^
                                        readingPageWordElements
    exampleSentences                    ^          
    ^                                   queEditingCard$.next(editingCard)        
    |                                   ^
    |                                   highlightedWord$.next(highlightedWord)
    |                                   ^
    readingPageAtomizedSentences---------
    ^             
    addOpenBook$.next(mainPage)
    `,
                    {
                    quizPageWordElements: {'一': [{el: {nodeValue: '一'}}]},
                    bottomNavigationValue$, QUIZ_PAGE: NavigationPages.QUIZ_PAGE,
                    readingPageWordElements: {'一': [{el: {nodeValue: '一'}}]},
                    exampleSentences: [ { translatableText: `TODO` } ],
                    queEditingCard$, editingCard:  EditingCard.fromICard(getNewICardForWord('一', ''), manager.cardDBManager, manager.audioManager, manager.cardManager ),
                    highlightedWord$, highlightedWord: '一',
                    readingPageAtomizedSentences: { translatableText: `TODO` },
                    mainPage: new Website( "Basic Doc", "BasicDoc.html", UnitTestGetPageSrc ),
                    addOpenBook$,
                })
            )
    });
});

