import {ReplaySubject} from "rxjs";
import React, {useContext, useState} from "react";
import {FileChooser} from "../components/directory/file-chooser.component";
import {LanguageSelect} from "../components/directory/nodes/language-select.component";
import {DocumentSelect} from "./document-select.component";
import {ToggleTranslate} from "../components/directory/toggle-translate";
import {TogglePinyin} from "../components/directory/toggle-pinyin";
import {ManagerContext} from "../App";
import {useObservableState} from "observable-hooks";
import {SignupLogin} from "../components/directory/nodes/signup.component";

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
                <ToggleTranslate/>
                <TogglePinyin/>
            </div>
        );

        this.testingUtils = new NavModal(
            'testingUtils ',
            () => {
                const m = useContext(ManagerContext);
                const manualIsRecording = useObservableState(m.settingsService.manualIsRecording$) || false;
                const [speechRecInput, setSpeechRecInput] = useState<HTMLInputElement | null>();
                return <div>
                    <SignupLogin/>
                    <input id='manual-is-recording' type="check" checked={manualIsRecording}/>
                    <input id='manual-speech-recognition-input' ref={setSpeechRecInput}/>
                    <button id='submit-manual-speech-recognition' onClick={
                        () => m.pronunciationProgressService.addRecords$.next([
                                {
                                    word: speechRecInput?.value || '',
                                    success: true,
                                    timestamp: new Date()
                                }
                            ]
                        )
                    }>Submit manual speech recognition
                    </button>
                    <button id='clear-speech-recognition-rows'
                            onClick={() => m.pronunciationProgressService.clearRecords$.next()}>
                        Clear speech recognition rows
                    </button>
                </div>
            }
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

export class NavModal {
    open$ = new ReplaySubject<boolean>(1);

    constructor(
        public id: string,
        public CardContents: React.FC<any>
    ) {
    }
}
