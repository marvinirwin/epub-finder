import {DocumentViewDto} from "../documents/document-view.dto";

export class LtDocument {
    d: DocumentViewDto;
    constructor(d: DocumentViewDto) {
        this.d = d;
    }
    id() {
        return (this.d.document_id || this.d.id)
    }
    get name() {
        return this.d.name;
    }
    get global() {
        return this.d.global;
    }
    get createdAt() {
        return this.d.created_at;
    }
    get filename() {
        return this.d.filename;
    }

    url() {
        return `${process.env.PUBLIC_URL}/documents/${this.filename}`
    }
}

export const ltDocId = ({document_id, id}: {id: string, document_id?: string}) => {
    return document_id || id;
}