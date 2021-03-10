import React from "react";
import {FileChooser} from "../components/directory/upload.component";
import {LanguageSelect} from "../components/directory/nodes/language-select.component";
import {ToggleTranslateComponent} from "../components/settings/toggle-translate.component";
import {TogglePinyinComponent} from "../components/settings/toggle-pinyin.component";
import {ManualTestModal} from "../components/modals/test-modal/manual-test-modal.component";
import {AdjustFrequencyWeight} from "../components/directory/adjust-frequency-weight.component";
import {NavModal} from "./nav-modal";
import {SetVocab} from "../components/settings/set-vocab.component";
import {AdjustDateWeight} from "../components/directory/adjust-date-weight.component";
import {AdjustLengthWeight} from "../components/directory/adjust-length-weight.component";
import {LibraryTable} from "../components/library/library-table.component";
import {SetQuizWordLimit} from "../components/settings/set-new-quiz-word-limit";
import {WordCardDisplay} from "./word-card.modal.component";

export class ModalService {
    public languageSelect: NavModal;
    public fileUpload: NavModal;
    public documentSelect: NavModal;
    public settings: NavModal;
    public testingUtils: NavModal;
    public wordPaperDisplay: NavModal;

    constructor() {
        this.fileUpload = new NavModal(
            'fileUpload',
            () => <FileChooser/>
        );
        this.languageSelect = new NavModal(
            'spokenLanguage',
            () => <LanguageSelect/>
        );
        this.documentSelect = new NavModal(
            'documentSelect',
            () => <LibraryTable/>
        );

        this.settings = new NavModal(
            'settings',
            () => <div>
                <ToggleTranslateComponent/>
                <TogglePinyinComponent/>
                <AdjustFrequencyWeight/>
                <AdjustDateWeight/>
                <AdjustLengthWeight/>
                <SetVocab/>
                <SetQuizWordLimit/>
            </div>
        );


        this.testingUtils = new NavModal(
            'testingUtils ',
            ManualTestModal
        );

        this.wordPaperDisplay = new NavModal(
            'wordPaperDisplay',
            WordCardDisplay
        )
    }

    public modals() {
        return [
            this.fileUpload,
            this.languageSelect,
            this.documentSelect,
            this.settings,
            this.testingUtils,
            this.wordPaperDisplay
        ]
    }
}

