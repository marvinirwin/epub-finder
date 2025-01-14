import React from 'react'
import {Manager} from '../../lib/manager/Manager'
import {ArrayToTreeParams, arrayToTreeRoot} from './directory.factory'
import {TreeMenuNode} from './tree-menu-node.interface'
import {QuizScheduleNode} from './nodes/quiz-schedule.node'
import {QuizCarouselNode} from './nodes/quiz-carousel.node'
import {RecognizeSpeechNode} from './nodes/recognize-speech.node'
import {WatchPronunciationNode} from './nodes/watch-pronunciation.node'
import {TestingUtilsNode} from './nodes/testing-utils.node'
import {SettingsNode} from './nodes/settings.node'
import {LanguageSelectNode} from './nodes/language-select.node'
import {LibraryNode} from './nodes/library.node'
import {SignInWithNode} from './nodes/sign-in-with.node'
import {DEV} from '../../lib/util/url-params'
import {ReadingProgressNode} from './nodes/reading-progress.node'
import {CSV} from '@shared/'
import {LeaderBoardNode} from "./nodes/leader-board.node";
import {ReadingNode} from "./reading.node";

export function AppDirectory(m: Manager) {
    return arrayToTreeRoot<TreeMenuNode>(QuizCarouselNode, [
        ReadingNode(m),
        SignInWithNode(),
        LanguageSelectNode(m),
        RecognizeSpeechNode(m),
        WatchPronunciationNode(m),
        LibraryNode,
        ReadingProgressNode(m),
        QuizScheduleNode(m),
        LeaderBoardNode(m),
        SettingsNode(m),
        TestingUtilsNode(m),
        {
            name: CSV,
            hidden: !DEV,
            label: 'Csv',
            action: () => m.modalService.csv.open$.next(true),
        }
        /*
                TranslationAttemptSchedule,
        */
    ] as ArrayToTreeParams<TreeMenuNode>)
}
