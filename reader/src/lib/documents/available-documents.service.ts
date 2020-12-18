/**
 * All documents available remotely
 */
import { ReplaySubject} from "rxjs";
import { DocumentViewDto, AvailableDocumentDto } from "@server/*";
import axios from "axios";



export class AvailableDocumentsService {
    available$ = new ReplaySubject<AvailableDocumentDto[]>(1)
    constructor() {
        this.available$.next([]);
        this.fetchAvailableDocuments()
    }

    async fetchAvailableDocuments(): Promise<void> {
        const response = await axios.get(`${process.env.PUBLIC_URL}/documents/available`);
        /**
         * TODO find a way to retrieve just their names, or their names + ids
         */
        // If there's no data there will be an error, which will appear in the toast
        response?.data && this.available$.next(response.data as AvailableDocumentDto[]);
    }

/*
    fetchDocument(a: AvailableDocumentDto): Promise<DocumentViewDto> {
        return axios.get(`${process.env.PUBLIC_URL}/documents/${a.id}`)
            .then(response => response.data);
    }
*/
}