import {ReplaySubject} from "rxjs";
import {LibraryDocument} from "./library-document.class";
import axios from 'axios';

export class RemoteDocumentsService {
    remoteDocuments$ = new ReplaySubject<LibraryDocument[]>()
    constructor() {
        this.fetchRemoteDocuments()
    }
    public async fetchRemoteDocuments() {
    }
}