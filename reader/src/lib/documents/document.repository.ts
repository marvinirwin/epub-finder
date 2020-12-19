import axios from 'axios';
import {DocumentViewDto, DocumentToBeSavedDto} from '@server/'
import {DatabaseService} from "../Storage/database.service";

export class DocumentRepository {
    private databaseService: DatabaseService;

    constructor({databaseService}: { databaseService: DatabaseService }) {
        this.databaseService = databaseService;
    }
    all(): Promise<DocumentViewDto[]> {
        return axios.get(`${process.env.PUBLIC_URL}/documents`)
            .then(response => response.data as DocumentViewDto[])
    }

    delete(document_id: string) {
        return axios.put(
            `${process.env.PUBLIC_URL}/documents`,
            {document_id, delete: true},
        ).then(response => {
            return response?.data;
        })
    }

    update(document_id: string, file: File) {
        return DocumentRepository.uploadFile(file, document_id);
    }

    create(file: File) {
        return DocumentRepository.uploadFile(file, undefined);
    }

    upsert({file, document_id}: {
        document_id?: string,
        file: File
    }): Promise<DocumentViewDto> {
        return DocumentRepository.uploadFile(file, document_id);
    }

    private static uploadFile(file: File, document_id: string | undefined) {
        const formData = new FormData();
        formData.append("file", file);

        return axios.put(
            `${process.env.PUBLIC_URL}/documents/upload`,
            formData,
            {
                headers: {
                    document_id,
                    filename: file.name
                }
            }
        ).then(response => {
            return response?.data;
        })
    }

}