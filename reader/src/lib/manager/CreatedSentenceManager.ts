import {DatabaseService} from "../Storage/database.service";
import {Observable, Subject} from "rxjs";
import {CreatedSentence} from "../../../../server/src/shared/CreatedSentence";
import {scan, shareReplay} from "rxjs/operators";
import { Dictionary } from "lodash";

export class CreatedSentenceManager {
    addUnpersistedCreatedSentence$ = new Subject<CreatedSentence[]>();
    addPersistedCreatedSentence$ = new Subject<CreatedSentence[]>();
    allCreatedSentences$: Observable<Dictionary<CreatedSentence[]>>;
    constructor(public db: DatabaseService) {
        this.addUnpersistedCreatedSentence$.subscribe(createdSentences => {
            createdSentences.forEach(createdSentence => {
                this.db.createdSentences.add(createdSentence).then(id => {
                    createdSentence.id = id;
                });
            })
            this.addPersistedCreatedSentence$.next(createdSentences);
        });
        this.allCreatedSentences$ = this.addPersistedCreatedSentence$.pipe(
            scan((createdSentenceMap: Dictionary<CreatedSentence[]>, newCreatedSentences) => {
                newCreatedSentences.forEach(createdSentence => {
                    if (createdSentenceMap[createdSentence.learningLanguage]) {
                        createdSentenceMap[createdSentence.learningLanguage].push(createdSentence);
                    } else {
                        createdSentenceMap[createdSentence.learningLanguage] = [createdSentence];
                    }
                })
                return createdSentenceMap;
            }, {}),
            shareReplay(1)
        );

    }
    async load() {
        for await (const sentences of this.db.getCardsFromDB({}, 500)) {
            this.addPersistedCreatedSentence$.next(sentences);
        }
    }
}