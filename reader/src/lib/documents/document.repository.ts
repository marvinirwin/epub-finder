import axios from 'axios'
import { DocumentViewDto } from '@shared/'
import { DatabaseService } from '../Storage/database.service'
import { merge, Observable, ReplaySubject } from 'rxjs'
import { mapFromId, mergeMaps } from '../util/map.module'
import { LtDocument } from '@shared/'
import { createLoadingObservable } from '../util/create-loading-observable'
import { TESTING } from '../util/url-params'
import { LanguageConfigsService } from '../language/language-configs.service'
import { map, scan } from 'rxjs/operators'
import {ModalService} from "../user-interface/modal.service";

export class DocumentRepository {
    collection$: Observable<Map<string, LtDocument>>
    isFetching$: Observable<boolean>
    newDocument$ = new ReplaySubject<LtDocument>(1)
    deleteDocument$ = new ReplaySubject<LtDocument>(1)
    private databaseService: DatabaseService

    constructor({
                    databaseService,
                    languageConfigsService,
        modalService
                }: {
        modalService: ModalService
        databaseService: DatabaseService,
        languageConfigsService: LanguageConfigsService
    }) {
        this.databaseService = databaseService
        const {
            obs$,
            isLoading$,
        } = createLoadingObservable(languageConfigsService.readingLanguageCode$, async (language_code) => {
            const response = await axios.get(
                `${process.env.PUBLIC_URL}/documents`,
                {
                    params: { language_code },
                },
            )
            const responseDocuments = ((response?.data ||
                []) as DocumentViewDto[]).map((d) => new LtDocument(d))
            return mapFromId<string, LtDocument>(
                responseDocuments,
                (d) => d.id(),
            )
        })

        this.collection$ = merge(
            obs$.pipe(map(fetchedDocumentMap => ({ fetchedDocumentMap }))),
            this.newDocument$.pipe(map(newDocument => ({ newDocument }))),
            this.deleteDocument$.pipe(map(deletedDocument => ({ deletedDocument }))),
        ).pipe(
            scan((acc, o: { newDocument: LtDocument } | { fetchedDocumentMap: Map<string, LtDocument> } | { deletedDocument: LtDocument }) => {
                // @ts-ignore
                const fetchedDocumentMap: Map<string, LtDocument> | undefined = o.fetchedDocumentMap
                // @ts-ignore
                const newDocument: LtDocument | undefined = o.newDocument
                // @ts-ignore
                const deletedDocument: LtDocument | undefined = o.deletedDocument
                if (fetchedDocumentMap) {
                    return fetchedDocumentMap
                }
                if (newDocument) {
                    return mergeMaps(acc, new Map([[(newDocument as LtDocument).id(), newDocument]]))
                }
                if (deletedDocument) {
                    acc.delete(deletedDocument.id())
                    return new Map(acc)
                }
                return acc
            }, new Map()),
        )
        this.isFetching$ = isLoading$;
        this.collection$.subscribe(collection => {
            const noDocuments = !collection.size;
            if (noDocuments) {
                modalService.intro.open$.next(true);
            }
        })
    }

    private static async uploadFile(
        file: File,
        language_code: string,
        documentId?: string,
    ): Promise<LtDocument> {
        const formData = new FormData()
        formData.append('file', file)

        const headers: {
            document_id?: string
            sandbox_file?: string
            language_code: string
        } = {
            language_code: language_code,
        }
        if (documentId) {
            headers.document_id = documentId
        }
        if (TESTING) {
            headers.sandbox_file = '1'
        }
        const result = await axios.put(
            `${process.env.PUBLIC_URL}/documents/`,
            formData,
            {
                headers,
            },
        )
        const d = (await result).data
        return new LtDocument(d)
    }

    public delete(ltDocument: LtDocument) {
        return axios
            .post(`${process.env.PUBLIC_URL}/documents/update`, {
                ...ltDocument.d,
                deleted: true,
            })
            .then((response) => {
                this.deleteDocument$.next(ltDocument)
            })
    }

    public async upsert({
                            file,
                            documentId,
                            language_code,
                        }: {
        documentId?: string,
        language_code: string
        file: File
    }): Promise<LtDocument> {
        const uploadedDocument = await DocumentRepository.uploadFile(file, language_code, documentId)
        this.newDocument$.next(uploadedDocument)
        return uploadedDocument
    }
}
