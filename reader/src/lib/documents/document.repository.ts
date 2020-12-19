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
            .then(response => (response?.data || []) as DocumentViewDto[])
    }

    delete(document_id: string) {
        return axios.delete(
            `${process.env.PUBLIC_URL}/documents/${document_id}`
        ).then(response => {
            return response?.data;
        })
    }

    upsert({file, document_id}: {
        document_id?: string,
        file: File
    }): Promise<DocumentViewDto> {
        return DocumentRepository.uploadFile(file, document_id);
    }

    private static uploadFile(file: File, document_id?: string) {
        const formData = new FormData();
        formData.append("file", file);

        return axios.put(
            `${process.env.PUBLIC_URL}/documents/`,
            formData,
            {
                headers: {
                    document_id,
                    filename: file.name,
                    name: file.name.split('.').slice(0, -1).join('')
                }
            }
        ).then(response => {
            return response?.data;
        })
    }
}