import {ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager} from "../../lib/Manager";
import {combineLatest, Observable} from "rxjs";
import {distinctUntilChanged, map, startWith} from "rxjs/operators";
import {ArrayToTreeParams, arrayToTreeRoot} from "./directory.factory";
import {ReadingNode} from "./nodes/reading.node";
import {TreeMenuNode} from "./tree-menu-node.interface";
import {DocumentSelectionRowInterface} from "../../lib/document-selection/document-selection-row.interface";
import {Profile} from "../../lib/auth/loggedInUserService";
import {UploadNode} from "./nodes/upload.node";
import {QuizScheduleNode} from "./nodes/quiz-schedule.node";
import {QuizCarouselNode} from "./nodes/quiz-carousel.node";
import {RecognizeSpeechNode} from "./nodes/recognize-speech.node";
import {WatchPronunciationNode} from "./nodes/watch-pronunciation.node";
import {TestingUtilsNode} from "./nodes/testing-utils.node";
import {SettingsNode} from "./nodes/settings.node";
import {SpeechPracticeNode} from "./nodes/speech-practice.node";
import {LanguageSelectNode} from "./nodes/language-select.node";
import {LibraryNode} from "./nodes/library.node";
import {SignInWithNode} from "./nodes/sign-in-with.node";
import {ProgressNode} from "./nodes/progress.node";

export const TESTING = new URLSearchParams(window.location.search).has('test')
export const DEV = new URLSearchParams(window.location.search).has('dev')


function AppDirectory(
    m: Manager, selectedComponent: string | undefined,
    availableDocuments: DocumentSelectionRowInterface[],
    profile: Profile | undefined) {
    return arrayToTreeRoot<TreeMenuNode>(
        ReadingNode(m),
        [
            ReadingNode(m, selectedComponent === 'reading'),
            [
                LanguageSelectNode(m)
            ],
            SignInWithNode(profile),
            RecognizeSpeechNode(m),
            WatchPronunciationNode(m),
            LibraryNode(m),
            UploadNode(m),
            SettingsNode(m),
            TestingUtilsNode(m),
            QuizCarouselNode(),
            QuizScheduleNode(),
            ProgressNode,
            SpeechPracticeNode,
        ] as ArrayToTreeParams<TreeMenuNode>
    );
}

export const AppDirectoryService = (m: Manager): Observable<ds_Tree<TreeMenuNode>> => {
    // This is going to break the way I do "Selected components".
    // I should do selected components by path, that way their refs can change?
    // Also I gotta make sure all my values are unique in that loop
    return combineLatest([
        m.authManager.profile$.pipe(
            startWith(undefined)
        ),
        m.documentSelectionService.documentSelectionRows$.pipe(
            startWith([] as DocumentSelectionRowInterface[]),
        ),
        m.treeMenuService.selectedComponentNode$.pipe(
            startWith(undefined),
            map(c => c?.name),
            distinctUntilChanged(),
        )
    ]).pipe(
        map(([
                 profile,
                 availableDocuments,
                 selectedComponent
             ]) => {
            return AppDirectory(
                m,
                selectedComponent,
                availableDocuments,
                profile
            );
            /*
                        const reading = menuNodeFactory(ReadingComponent, 'Reading', 'reading', true);
            */
            /*
                        if (DEVELOPER_MODE) {
                            rootTree.children.AllSentences = constructTree(
                                'AllSentences',
                                menuNodeFactory(() => <AllSentences m={m}/>, 'AllSentences', 'AllSentences', false)
                            );
                            rootTree.children.resetIntro = {
                                nodeLabel: 'resetIntro',
                                value: {
                                    name: 'resetIntro',
                                    label: 'resetIntro',
                                    InlineComponent: () => <ListItem
                                        button
                                        onClick={() => m.settingsService.completedSteps$.next([])}
                                    >Reset tutorial
                                    </ListItem>,
                                },
                            };
                        }
            */
            // return rootTree;
        })
    )
}