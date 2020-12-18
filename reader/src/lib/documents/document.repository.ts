import axios from 'axios';
import {DocumentViewDto, DocumentToBeSavedDto} from '@server/'
import {DatabaseService} from "../Storage/database.service";

export class DocumentRepository {
    private databaseService: DatabaseService;
    constructor({databaseService}:{ databaseService: DatabaseService }) {
        this.databaseService = databaseService;
    }

    persistDocument(documentToBeSaved: DocumentToBeSavedDto): Promise<DocumentViewDto> {
        return axios.put(`${process.env.PUBLIC_URL}/documents`, documentToBeSaved)
            .then(response => {
                return response?.data;
            })
    }

    fetchRemoteDocuments(): Promise<DocumentViewDto[]> {
        return axios.get(`${process.env.PUBLIC_URL}/documents/all`)
            .then(response => response.data as DocumentViewDto[])
    }
}