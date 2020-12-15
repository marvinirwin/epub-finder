import {ReadingBookService} from "../../lib/Manager/reading-book.service";
import {BehaviorSubject, combineLatest, Observable, ReplaySubject} from "rxjs";
import {distinctUntilChanged, map, shareReplay} from "rxjs/operators";
import {RecordRequestSentence} from "./record-request.interface";
import {observableLastValue} from "../../services/settings.service";
import axios from "axios";

export class RequestRecordingService {
    recordRequestSentences$ = new ReplaySubject<Map<string, boolean>>(1);
    allRecordRequestsSubmitted = new ReplaySubject<Set<string>>(1);
    allSentences$: Observable<string[]>;
    infoMessages$ = new ReplaySubject<string>(1);

    constructor({readingBookService}: {
        readingBookService: ReadingBookService
    }) {
        this.allRecordRequestsSubmitted.next(new Set());
        this.recordRequestSentences$.next(new Map())

        this.allSentences$ = readingBookService.readingBook.renderedSentences$.pipe(
            map(Object.keys),
            shareReplay(1)
        );
        this.fetchAllRecordRequests();
    }


    async sendRecordingRequests() {
        const sentences = await observableLastValue(this.allSentences$);
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