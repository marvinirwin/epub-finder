import {Document} from '../entities/document.entity'
export interface DocumentUpdateDto extends Partial<Document> {
    for_frequency: boolean;
    name: string;
    for_reading: boolean;
    global: boolean;
    id: string;
    deleted: boolean
}