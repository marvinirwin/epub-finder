import axios from 'axios';
import {DocumentViewDto, DocumentToBeSavedDto} from '@server/'
import {DatabaseService} from "../Storage/database.service";

export class DocumentRepository {
    private databaseService: DatabaseService;

    constructor({databaseService}: { databaseService: DatabaseService }) {
        this.databaseService = databaseService;
    }

    upsert({file, document_id}: { document_id?: string, file: File }): Promise<DocumentViewDto> {
        const formData = new FormData();
        formData.append("file", file);

        return axios.put(
            `${process.env.PUBLIC_URL}/documents`,
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

    queryAll(): Promise<DocumentViewDto[]> {
        return axios.get(`${process.env.PUBLIC_URL}/documents/all`)
            .then(response => response.data as DocumentViewDto[])
    }
}