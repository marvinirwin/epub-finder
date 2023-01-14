import {createLoadingObservable} from "../lib/util/create-loading-observable";
import {ReplaySubject} from "rxjs";
import axios from "axios";
import {LeaderBoardDto} from "@shared/";
import {LoadingObservable} from "./quiz/word-card.interface";
import { getApiUrl } from "../lib/util/getApiUrl";

export class LeaderBoardService {
    fetchLoaderBoardSignal$ = new ReplaySubject<void>(1);
    leaderBoard: LoadingObservable<LeaderBoardDto>
    constructor({}: {}) {
        this.leaderBoard = createLoadingObservable(
            this.fetchLoaderBoardSignal$,
            () => axios
                .get(getApiUrl("/api/leader-board"))
                .then((response) => (response?.data as LeaderBoardDto) )
            ,
        );
        this.fetchLoaderBoardSignal$.next();
    }
}