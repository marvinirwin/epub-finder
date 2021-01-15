import {ReplaySubject} from "rxjs";
import React, {ReactNode} from "react";
import {FileChooser} from "../components/directory/file-chooser.component";
import {LanguageSelect} from "../components/directory/nodes/language-select.component";

export class ModalService {
    public languageSelect: NavModal;
    public fileUpload: NavModal;

    constructor() {
        this.fileUpload = new NavModal(
            'fileUpload',
            () => <FileChooser/>
        );
        this.languageSelect = new NavModal(
            'spokenLanguage',
            () => <LanguageSelect/>
        )
    }
    public modals() {
        return [
            this.fileUpload,
            this.languageSelect
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
