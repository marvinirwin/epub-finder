import {ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager} from "../../lib/Manager";
import {combineLatest, Observable} from "rxjs";
import {distinctUntilChanged, map, startWith} from "rxjs/operators";
import {ArrayToTreeParams, arrayToTreeRoot} from "./directory.factory";
import {ReadingNode} from "./nodes/reading.node";
import {TreeMenuNode} from "./tree-menu-node.interface";
import {DocumentSelectionRowInterface} from "../../lib/document-selection/document-selection-row.interface";
import {Profile} from "../../lib/Auth/loggedInUserService";
import {SignupNode} from "./nodes/signup.node";
import {SignoutNode} from "./nodes/signout.node";
import {ToggleTranslateNode} from "./nodes/toggle-translate.node";
import {SignInWithNode} from "./nodes/sign-in-with.node";
import {GoogleSigninNode} from "./nodes/google-sign-in.node";
import {ProfileNode} from "./nodes/profile.node";
import {uploadNode} from "./nodes/upload.node";
import {QuizScheduleNode} from "./nodes/quiz-schedule.node";
import {QuizCarouselNode} from "./nodes/quiz-carousel.node";
import {RecognizeSpeechNode} from "./nodes/recognize-speech.node";
import {WatchPronunciationNode} from "./nodes/watch-pronunciation.node";
import {ManualSpeechRecognitionNode} from "./nodes/manual-speech-recognition.node";
import {SettingsNode} from "./nodes/settings.node";
import {DailyGoalSettingNode} from "./nodes/daily-goal-setting.node";
import {TogglePinyinNode} from "./nodes/toggle-pinyin.node";
import {SpeechPracticeNode} from "./nodes/speech-practice.node";
import {LanguageSelectNode} from "./nodes/language-select.node";
import {LibraryNode} from "./nodes/library.node";

export const TESTING = new URLSearchParams(window.location.search).has('test')


function AppDirectory(
    m: Manager, selectedComponent: string | undefined,
    availableDocuments: DocumentSelectionRowInterface[],
    profile: Profile | undefined) {
    return arrayToTreeRoot<TreeMenuNode>(
        ReadingNode(m),
        [
            ReadingNode(m, selectedComponent === 'reading'),
            SpeechPracticeNode,
            [
                LanguageSelectNode(m)
            ],
            SignInWithNode(profile),
            [
                GoogleSigninNode(),
            ],
            RecognizeSpeechNode(m),
            WatchPronunciationNode(m),
/*
            PlaybackSpeedNode(),
*/
            uploadNode(m),
            LibraryNode(m),
            /*
                        availableDocuments.map(toTreeMenuNode),
            */
            ProfileNode(profile),
            SettingsNode,
            [
                ToggleTranslateNode(),
                TogglePinyinNode(),
                DailyGoalSettingNode,
            ],
            SignupNode(),
            SignoutNode(m, profile),
            ManualSpeechRecognitionNode(),
            QuizCarouselNode(),
            [
                {...QuizCarouselNode(), moveDirectory: false},
                QuizScheduleNode(),
            ],
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