import React from "react";
import {FileChooser} from "../components/directory/upload.component";
import {LanguageSelect} from "../components/directory/nodes/language-select.component";
import {DocumentSelect} from "./reading-document-select.component";
import {ToggleTranslateComponent} from "../components/settings/toggle-translate.component";
import {TogglePinyinComponent} from "../components/settings/toggle-pinyin.component";
import {ManualTestModal} from "../components/modals/manual-test-modal.component";
import {AdjustFrequencyWeight} from "../components/directory/adjust-frequency-weight.component";
import {NavModal} from "./nav-modal";
import {SetVocab} from "../components/settings/set-vocab.component";

export class ModalService {
    public languageSelect: NavModal;
    public fileUpload: NavModal;
    public documentSelect: NavModal;
    public settings: NavModal;
    public testingUtils: NavModal;

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
            () => <DocumentSelect/>
        );

        this.settings = new NavModal(
            'settings',
            () => <div>
                <ToggleTranslateComponent/>
                <TogglePinyinComponent/>
                <AdjustFrequencyWeight/>
                <SetVocab/>
            </div>
        );


        this.testingUtils = new NavModal(
            'testingUtils ',
            ManualTestModal
        )
    }

    public modals() {
        return [
            this.fileUpload,
            this.languageSelect,
            this.documentSelect,
            this.settings,
            this.testingUtils
        ]
    }
}

