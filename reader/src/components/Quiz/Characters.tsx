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
import {Observable} from "rxjs";
import QuizStatsHeader from "./QuizStatsHeaders";
import {map, take, withLatestFrom} from "rxjs/operators";
import {useObservable, useObservableState} from "observable-hooks";
import {PageRenderer} from "../../lib/PageRenderer";
import {AtomizedFrameContainer} from "../Atomized/AtomizedFrameContainer";
import {InputManager} from "../../lib/Manager/InputManager";
import {GetWorkerResults} from "../../lib/Util/GetWorkerResults";
import {uniq} from "lodash";
import {AtomizedSentence} from "../../lib/Atomized/AtomizedSentence";


export function Characters({c, m}: QuizCardProps) {
    const classes = quizStyles();
    const trie = useObservableState(m.cardManager.trie$);
    let advance = () => m.quizManager.quizzingComponent$.next("Pictures");
    const sentences$ = useObservableState(useObservable<string[], [string | undefined]>(
        (obs$: Observable<[string | undefined]>) =>
            obs$.pipe(
                withLatestFrom(m.textData$),
                map(([[word], {wordSentenceMap}]) =>
                    (wordSentenceMap[word || ''] || []).map((s: AtomizedSentence) => s.translatableText)
                )
            )
        , [c?.learningLanguage],
    ));
    const [pageRenderer, setPageRenderer] = useState();
    useEffect(() => {
        if (sentences$ && trie) {
            // With the sentences we create a new pageRenderer
            let src = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Random Title</title>
</head>
<body>
${sentences$?.map(sentence => {
                return `<div>${sentence}</div>`;
            })}
</body>
</html>
        `;
            GetWorkerResults(new AtomizeSrcdoc(), src).then(atomizedSrc => {
                let pageRenderer1 = new PageRenderer(atomizedSrc, 'character_translation');
                setPageRenderer(pageRenderer1);
                pageRenderer1.atomizedSentences$.subscribe(atomizedSentences => {
                    atomizedSentences.forEach(atomizeSentence => {
                        InputManager.applySentenceElementSelectListener(atomizeSentence);
                    });
                    const textWordData = AtomizedSentence.getTextWordData(
                        atomizedSentences,
                        trie,
                        uniq(trie.getWords(false).map(v => v.length))
                    );
                    Object.values(textWordData.wordElementsMap).forEach(elements =>
                        elements.forEach(element => m.applyWordElementListener(element))
                    )
                });
            });

        }
    }, [sentences$, trie]);


    const [error, setError] = useState('');
    useEffect(() => {
        setError("");// The card has changed, clear the error message
        if (!c) return;
        m.audioManager.audioRecorder.quedRecordRequest$.next({
            duration: 1,
            cb: async (createdSentence: string) => {
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
                    setError('');
                    m.createdSentenceManager
                        .addUnpersistedCreatedSentence$
                        .next([{learningLanguage: createdSentence}])
                    advance();
                }
            },
            label: c?.learningLanguage,
        })
    }, [c])
    return <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
            <div>
                <Typography variant="h1" component="h1" className={classes.center}>
                    {c?.learningLanguage}
                </Typography>
            </div>
            <div style={{flexGrow: 1, width: '100%'}}>
                {pageRenderer && <AtomizedFrameContainer rb={pageRenderer} m={m}/>}
            </div>
        </CardContent>
        <CardActions className={classes.cardActions}>
            <QuizStatsHeader m={m}/>
            <Button onClick={advance}>Next</Button>
        </CardActions>
    </Card>
}