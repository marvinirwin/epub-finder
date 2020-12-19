import axios from "axios";
import {AvailableDocumentDto} from "@server/*";

export class AvailableDocumentRepository {
    static all(): Promise<AvailableDocumentDto[]> {
        return axios.get(`${process.env.PUBLIC_URL}/documents/available`)
            .then(response => response.data);
    }
}