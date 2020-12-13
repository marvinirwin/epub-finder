import {DatabaseService} from "../lib/Storage/database.service";
import axios from 'axios';
import {BookViewDto, BookToBeSavedDto} from '@server/'
import {BasicDocument} from "../types";

export class DocumentRepository {
    private databaseService: DatabaseService;
    constructor({databaseService}:{ databaseService: DatabaseService }) {
        this.databaseService = databaseService;
    }

    persistDocument(bookToBeSaved: BookToBeSavedDto): Promise<BookViewDto> {
        return axios.post(`${process.env.PUBLIC_URL}/books`, bookToBeSaved)
            .then(response => response.data)
    }

    fetchRemoteDocuments(): Promise<BookViewDto[]> {
        return axios.get(`${process.env.PUBLIC_URL}/books`)
            .then(response => response.data as BookViewDto[])
    }
}