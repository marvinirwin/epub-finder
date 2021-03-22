import {ds_Tree} from "../../services/tree.service";
import React from "react";
import {Manager} from "../../lib/Manager";
import {combineLatest, Observable} from "rxjs";
import {distinctUntilChanged, map, startWith} from "rxjs/operators";
import {ArrayToTreeParams, arrayToTreeRoot} from "./directory.factory";
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
import {TranslationAttemptNode, TranslationAttemptSchedule} from "./nodes/translation-attempt-schedule";
import {ReadingComponent} from "../reading/reading.component";

export const TESTING = new URLSearchParams(window.location.search).has('test')
export const DEV = new URLSearchParams(window.location.search).has('dev')


export const ReadingNode = (m: Manager): TreeMenuNode => ({
    Component: () => <ReadingComponent m={m}/>,
    label: 'Read',
    name: 'reading',
    hidden: !DEV,
})

export function AppDirectory(
    m: Manager) {
    return arrayToTreeRoot<TreeMenuNode>(
        QuizCarouselNode(),
        [
            ReadingNode(m),
            SignInWithNode(),
            LanguageSelectNode(m),
            RecognizeSpeechNode(m),
            WatchPronunciationNode(m),
            LibraryNode(m),
            UploadNode(m),
            SettingsNode(m),
            TestingUtilsNode(m),
            TranslationAttemptSchedule,
            TranslationAttemptNode,
            QuizCarouselNode(),
            QuizScheduleNode(m),
            ProgressNode,
            SpeechPracticeNode,
        ] as ArrayToTreeParams<TreeMenuNode>
    );
}

