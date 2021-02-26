import axios from "axios";
import {DocumentViewDto} from "../../../server/src/documents/document-view.dto";
import {LtDocument} from "@shared/";
import {mapFromId, mergeMaps} from "./map.module";
import {BehaviorSubject} from "rxjs";

export class AllWordsRepository {
    all$ = new BehaviorSubject<Set<string>>(new Set());

    constructor() {
        axios.get(`${process.env.PUBLIC_URL}/all_chinese_words.csv`)
            .then(response => {
                    const allWords = response.data.split('\n').map((word: string) => word.trim());
                    this.all$.next(new Set(allWords))
                }
            )
    }
}