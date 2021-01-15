import {ReplaySubject} from "rxjs";
import React, {ReactNode} from "react";
import {FileChooser} from "../components/directory/file-chooser.component";

export class ModalService {
    public spokenLanguageSelect: NavModal;
    public fileUpload: NavModal;
    public readingLanguageSelect: NavModal;

    constructor() {
        this.fileUpload = new NavModal(
            'fileUpload',
            () => <FileChooser/>
        );
        this.readingLanguageSelect = new NavModal(
            'readingLanguage',
            () => <FileChooser/>
        );
        this.spokenLanguageSelect = new NavModal(
            'spokenLanguage',
            () => <FileChooser/>
        )
    }
    public modals() {
        return [
            this.fileUpload,
            this.readingLanguageSelect,
            this.spokenLanguageSelect
        ]
    }
}

export class NavModal {
    open$ = new ReplaySubject<boolean>(1);

    constructor(
        public id: string,
        public cardContents: React.FC<any>
    ) {
    }
}
