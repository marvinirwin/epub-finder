export interface DocumentToBeSavedDto {
    document_id?: string;
    name: string;
    html?: string;
    deleted?: boolean;
}
