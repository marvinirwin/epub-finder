import React, { useContext, Fragment } from 'react'
import { LanguageSelect } from '../../components/app-directory/nodes/language-select.component'
import { ToggleTranslateComponent } from '../../components/settings/toggle-translate.component'
import { TogglePinyinComponent } from '../../components/settings/toggle-pinyin.component'
import { ManualTestModal } from '../../components/modals/test-modal/manual-test-modal.component'
import { AdjustFrequencyWeight } from '../../components/app-directory/adjust-frequency-weight.component'
import { NavModal } from './nav-modal'
import {
    AdjustDateWeight,
    AdjustTranslationAttemptSentenceWeight,
} from '../../components/app-directory/adjust-date-weight.component'
import { AdjustLengthWeight } from '../../components/app-directory/adjust-length-weight.component'
import { LibraryTable } from '../../components/library/library-table.component'
import { SetQuizWordLimit } from '../../components/settings/set-new-quiz-word-limit'
import { WordCardDisplay } from '../word-card/word-card.modal.component'
import { ManagerContext } from '../../App'
import { HotkeyConfig } from '../../components/hotkeys/HotkeyConfig'
import { QuizScheduleOverView } from '../quiz/quiz-schedule-over-view.component'
import { Intro } from '../../components/intro/intro.component'
import { UploadDialog } from '../../components/upload/upload-dialog'
import { Box } from '@material-ui/core'

export class ModalService {
    public languageSelect: NavModal
    public fileUpload: NavModal
    public library: NavModal
    public settings: NavModal
    public testingUtils: NavModal
    public wordPaperDisplay: NavModal
    public quizScheduleOverView: NavModal
    public intro: NavModal

    constructor() {
        this.intro = new NavModal('intro', () => <Intro />)
        this.fileUpload = new NavModal('fileUpload', () => <UploadDialog />)
        this.languageSelect = new NavModal('spokenLanguage', () => (
            <Box m={2} p={1} style={{height: '90vh', width: '90vw'}}><LanguageSelect /></Box>
        ))
        this.library = new NavModal('documentSelect', () => <Box m={2} p={1}><LibraryTable /></Box>)
        this.quizScheduleOverView = new NavModal('quizScheduleOverView', () => (
            <QuizScheduleOverView />
        ))

        this.settings = new NavModal('settings', () => {
            return (
                <Box m={2} p={1} style={{width: '90vw'}}>
                    <ToggleTranslateComponent />
                    <TogglePinyinComponent />
                    <AdjustFrequencyWeight />
                    <AdjustDateWeight />
                    <AdjustLengthWeight />
                    <AdjustTranslationAttemptSentenceWeight />
                    <SetQuizWordLimit />
                    <HotkeyConfig />
                </Box>
            )
        })

        this.testingUtils = new NavModal('testingUtils ', ManualTestModal)

        this.wordPaperDisplay = new NavModal(
            'wordPaperDisplay',
            WordCardDisplay,
        )
    }

    public modals() {
        return [
            this.fileUpload,
            this.languageSelect,
            this.library,
            this.settings,
            this.testingUtils,
            this.wordPaperDisplay,
            this.quizScheduleOverView,
            this.intro,
        ]
    }
}