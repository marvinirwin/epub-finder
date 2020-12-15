import {DatabaseService} from "../../lib/Storage/database.service";
import axios from 'axios';
import {BookViewDto, BookToBeSavedDto} from '@server/'

export class DocumentRepository {
    private databaseService: DatabaseService;
    constructor({databaseService}:{ databaseService: DatabaseService }) {
        this.databaseService = databaseService;
    }

    persistDocument(bookToBeSaved: BookToBeSavedDto): Promise<BookViewDto> {
        return axios.put(`${process.env.PUBLIC_URL}/books`, bookToBeSaved)
            .then(response => {
                return response?.data;
            })
    }

    fetchRemoteDocuments(): Promise<BookViewDto[]> {
        return axios.get(`${process.env.PUBLIC_URL}/books/all`)
            .then(response => response.data as BookViewDto[])
    }
}