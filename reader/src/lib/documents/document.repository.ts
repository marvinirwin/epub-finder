import axios from 'axios';
import {DocumentViewDto} from '@server/'
import {DatabaseService} from "../Storage/database.service";
import {BehaviorSubject} from "rxjs";
import {deleteMap, mapFromId, mergeMaps} from "../map.module";
import {LtDocument} from "@shared/";

export class DocumentRepository {
    private databaseService: DatabaseService;
    collection$ = new BehaviorSubject<Map<string, LtDocument>>(new Map());

    constructor({databaseService}: { databaseService: DatabaseService }) {
        this.databaseService = databaseService;
        this.fetchAll()
    }

    private fetchAll(): Promise<void> {
        return axios.get(`${process.env.PUBLIC_URL}/documents`)
            .then(response => {
                    const responseDocuments = ((response?.data || []) as DocumentViewDto[]).map(d => new LtDocument(d));
                    const mappedDocuments = mapFromId<string, LtDocument>(responseDocuments, d => d.id());
                    this.collection$.next(mergeMaps(mappedDocuments, this.collection$.getValue()));
                }
            )
    }

    public delete(document_id: string) {
        return axios.delete(
            `${process.env.PUBLIC_URL}/documents/${document_id}`
        ).then(response => {
            this.collection$.next(deleteMap(this.collection$.getValue(), document_id))
            return response?.data;
        })
    }

    public async upsert({file, document_id}: {
        document_id?: string,
        file: File
    }): Promise<LtDocument> {
        const result = await DocumentRepository.uploadFile(file, document_id);
        this.collection$.next(
            new Map(this.collection$.getValue())
                .set(result.id(), result)
        )
        return result;
    }

    private static async uploadFile(file: File, document_id?: string): Promise<LtDocument> {
        const formData = new FormData();
        formData.append("file", file);

        const headers: { document_id?: string } = {};
        if (document_id) {
            headers.document_id = document_id
        }
        const result = axios.put(
            `${process.env.PUBLIC_URL}/documents/`,
            formData,
            {
                headers
            }
        );
        return new LtDocument((await result).data);
    }
}