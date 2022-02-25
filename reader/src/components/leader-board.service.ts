import {createLoadingObservable} from "../lib/util/create-loading-observable";
import {ReplaySubject} from "rxjs";
import axios from "axios";
import {LeaderBoardDto} from "../../../server/src/shared/leader-board.dto";
import {LoadingObservable} from "./quiz/word-card.interface";

export class LeaderBoardService {
    fetchLoaderBoardSignal$ = new ReplaySubject<void>(1);
    leaderBoard: LoadingObservable<LeaderBoardDto>
    constructor({}: {}) {
        this.leaderBoard = createLoadingObservable(
            this.fetchLoaderBoardSignal$,
            () => axios
                .get(`${process.env.PUBLIC_URL}/leader-board`)
                .then((response) => (response?.data as LeaderBoardDto) )
            ,
        );
        this.fetchLoaderBoardSignal$.next();
    }
}