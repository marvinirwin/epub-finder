/* eslint import/no-webpack-loader-syntax:0 */
// @ts-ignore
import AtomizeSrcdoc from 'Worker-loader?name=dist/[name].js!../../lib/Worker/AtomizeSrcdoc';
import {Card, CardActions, CardContent} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React, {useEffect, useState} from "react";
import {QuizCardProps} from "./Popup";
import {Pictures} from "./Pictures";
import {quizStyles} from "./QuizStyles";
import {combineLatest, Observable} from "rxjs";
import QuizStatsHeader from "./QuizStatsHeaders";
import {distinctUntilChanged, filter, map, switchMap, take, tap} from "rxjs/operators";
import {useObservable, useObservableState} from "observable-hooks";
import {BookFrame} from "../../lib/BookFrame/BookFrame";
import {AtomizedFrameContainer} from "../Atomized/AtomizedFrameContainer";
import {InputManager} from "../../lib/Manager/InputManager";
import {GetWorkerResults} from "../../lib/Util/GetWorkerResults";
import {isEqual, uniq} from "lodash";
import {AtomizedSentence} from "../../lib/Atomized/AtomizedSentence";
import {PageManager} from "../../lib/Manager/PageManager";
import {RecordRequest} from "../../lib/Interfaces/RecordRequest";


function getSrc(sentences: string[]) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Random Title</title>
</head>
<body>
${sentences.map(sentence => {
        return `<div>${sentence}</div>`;
    })}
</body>
</html>
        `;
}

export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const [error, setError] = useState('');
    const [createdSentence, setCreatedSentence] = useState();
    const advance = () => {
        if (createdSentence) {
            m.quizManager.quizzingComponent$.next("Pictures");
        } else {
            setError("Please record novel sentence");
        }
    };
    const sentences$ = useObservableState(useObservable<string[], [string | undefined]>(
        (obs$: Observable<[string | undefined]>) =>
            combineLatest([
                    obs$,
                    m.textData$
                ]
            ).pipe(
                map(([[word], {wordSentenceMap}]) => {
                    return (wordSentenceMap[word || ''] || []).map((s: AtomizedSentence) => {
                            return s.translatableText;
                        });
                    }
                ),
                distinctUntilChanged(isEqual)
            )
        , [c?.learningLanguage],
    ), []);

    const bookFrame$ = useObservableState(useObservable((obs$: Observable<[string[]]>) =>
        obs$.pipe(
            filter(([strings]) => strings.length > 0),
            map(([sentences]) => {
                return getSrc(sentences);
            }),
            switchMap(async (src: string) => {
                const atomizedSrc = await GetWorkerResults(new AtomizeSrcdoc(), src);
                return new BookFrame(atomizedSrc, 'character_translation');
            })
        ), [sentences$])
    );

    useObservableState(useObservable((obs$: Observable<[BookFrame | undefined]>) =>
        obs$.pipe(
            filter(([pageRenderer]) => !!pageRenderer),
            switchMap(([pageRenderer]: [BookFrame | undefined]) => {
                return (pageRenderer as BookFrame).iframebody$;
            }),
            tap(iframeBody => {
                m.inputManager.applyListeners(iframeBody);
            })
        ), [bookFrame$]),
    );
    const atomizedSentences = useObservableState(useObservable((obs$: Observable<[BookFrame | undefined]>) =>
            combineLatest(
                [
                    obs$.pipe(
                        filter(([pageRenderer]) => !!pageRenderer),
                        switchMap(([pageRenderer]) => (pageRenderer as BookFrame).atomizedSentences$
                            .pipe(
                                filter(atomizedSentences => {
                                    return atomizedSentences.length > 0;
                                })
                            )
                        )
                    ),
                    m.cardManager.trie$
                ]
            ).pipe(
                tap(([atomizedSentences, trie]) => {
                    PageManager.ApplyAtomizedSentenceListeners(atomizedSentences);
                    atomizedSentences.forEach(atomizeSentence => {
                        InputManager.applySentenceElementSelectListener(atomizeSentence);
                    });
                    const textWordData = AtomizedSentence.getTextWordData(
                        atomizedSentences,
                        trie,
                        uniq(trie.getWords(false).map(v => v.length))
                    );
                    m.characterPageWordElementMap$.next(textWordData.wordElementsMap)
                })
            )
        , [bookFrame$])
    );

    useEffect(() => {
        setError('');// The card has changed, clear the error message
        if (!c?.learningLanguage) return;
        const r= new RecordRequest( `Please record sentence with the word ${c?.learningLanguage}`);
        r.sentence.then(async createdSentence => {
            if (!createdSentence) {
                return;
            }
            if (!createdSentence.includes(c.learningLanguage)) {
                setError(`The synthesized sentence (${createdSentence}) does not contain ${c.learningLanguage}`)
            }
            const allPreviousCreatedSentence = await m.createdSentenceManager.allCreatedSentences$.pipe(
                take(1),
            ).toPromise();

            if (allPreviousCreatedSentence[createdSentence]) {
                setError(`You have already said ${createdSentence}`)
            } else {
                setError(`Sentence "${createdSentence}" recorded`);
                advance();
            }
        })
    }, [c?.learningLanguage])
    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <Typography variant="h3">{error}</Typography>
            <div>
                <Typography variant="h1" component="h1" className={classes.center}>
                    {c?.learningLanguage}
                </Typography>
            </div>
            <div style={{flexGrow: 1, width: '100%'}}>
                {bookFrame$ && <AtomizedFrameContainer rb={bookFrame$} m={m}/>}
            </div>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}