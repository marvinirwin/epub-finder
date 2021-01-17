import {ReplaySubject} from "rxjs";
import React from "react";
import {FileChooser} from "../components/directory/file-chooser.component";
import {LanguageSelect} from "../components/directory/nodes/language-select.component";
import {DocumentSelect} from "./document-select.component";
import {ToggleTranslate} from "../components/directory/toggle-translate";
import {TogglePinyin} from "../components/directory/toggle-pinyin";

export class ModalService {
    public languageSelect: NavModal;
    public fileUpload: NavModal;
    public documentSelect: NavModal;
    public settings: NavModal;

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
                <ToggleTranslate/>
                <TogglePinyin/>
            </div>
        )
    }
    public modals() {
        return [
            this.fileUpload,
            this.languageSelect,
            this.documentSelect,
            this.settings
        ]
    }
}

export class NavModal {
    open$ = new ReplaySubject<boolean>(1);

    constructor(
        public id: string,
        public CardContents: React.FC<any>
    ) {
    }
}
