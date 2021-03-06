import {ReadingDocumentService} from "../../lib/manager/reading-document.service";
import {BehaviorSubject, combineLatest, Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, shareReplay} from "rxjs/operators";
import {observableLastValue} from "../../services/settings.service";
import axios from "axios";
import {LoggedInUserService} from "../../lib/auth/loggedInUserService";

export class RequestRecordingService {
    recordRequestSentences$ = new ReplaySubject<Map<string, boolean>>(1);
    allRecordRequestsSubmitted = new ReplaySubject<Set<string>>(1);
    allRenderedSentences$: Observable<string[]>;
    infoMessages$ = new ReplaySubject<string>(1);

    constructor({readingDocumentService, loggedInUserService}: {
        readingDocumentService: ReadingDocumentService,
        loggedInUserService: LoggedInUserService
    }) {
        this.allRecordRequestsSubmitted.next(new Set());
        this.recordRequestSentences$.next(new Map())

        this.allRenderedSentences$ = readingDocumentService
            .readingDocument
            .renderedSegments$
            .pipe(
                map(sentences => sentences.map(sentence => sentence.translatableText)),
                shareReplay(1)
            );
        loggedInUserService.isLoggedIn$.subscribe(isLoggedIn => {
            if (isLoggedIn) {
                this.fetchAllRecordRequests();
            }
        })
    }


    async sendRecordingRequests() {
        const sentences = await observableLastValue(this.allRenderedSentences$);
        const currentMap = await observableLastValue(this.recordRequestSentences$);
        const submittingSentences = sentences.filter(sentence => currentMap.get(sentence));
        await axios.post(
            `${process.env.PUBLIC_URL}/record-request`,
            submittingSentences
        )
            .then(response => this.infoMessages$.next(`${submittingSentences.length} Recording requests submitted`))
            .catch(error => this.infoMessages$.next(`There was an error submitting the recording requests`))
    }

    async fetchAllRecordRequests() {
        return axios.get(`${process.env.PUBLIC_URL}/record-request`)
            .then(response =>
                response?.data && this.allRecordRequestsSubmitted.next(new Set(response.data as string[]))
            )
    }
}