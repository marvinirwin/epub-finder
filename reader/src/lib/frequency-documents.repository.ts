import {BehaviorSubject, Observable} from "rxjs";
import {LtDocument} from "@shared/*";
import axios from "axios";
import {DocumentViewDto} from "../../../server/src/documents/document-view.dto";
import {mapFromId, mapMap, mergeMaps} from "./map.module";
import {FrequencyDocument} from "./frequency-documents";
import {TrieService} from "./manager/trie.service";
import {ScheduleRowsService} from "./manager/schedule-rows.service";
import {ScheduleRow} from "./schedule/ScheduleRow";
import {NormalizedScheduleRowData} from "./schedule/schedule-row.interface";
import {map, shareReplay} from "rxjs/operators";

export class FrequencyDocumentsRepository {
    all$ = new BehaviorSubject<Map<string, FrequencyDocument>>(new Map());

    constructor(
        {
            trieService,
            scheduleRowsService
        }: {
            trieService: TrieService,
            scheduleRowsService: ScheduleRowsService,
        }) {
        axios.get(`${process.env.PUBLIC_URL}/documents/frequency-documents`)
            .then(response => {
                    const responseDocuments = ((response?.data || []) as DocumentViewDto[]).map(d => new LtDocument(d));
                    const mappedDocuments = mapFromId<string, LtDocument>(responseDocuments, d => d.id());
                    const frequencyDocuments = mapMap(
                        mappedDocuments,
                        (id, frequencyDocument) => [id, new FrequencyDocument(
                            frequencyDocument,
                            scheduleRowsService.indexedScheduleRows$
                                .pipe(
                                    map(obj => new Map(Object.entries(obj))),
                                    shareReplay(1)
                                ),
                            trieService.trie$
                        )]
                    )
                    this.all$.next(mergeMaps(frequencyDocuments, this.all$.getValue()));
                }
            )
    }
}

