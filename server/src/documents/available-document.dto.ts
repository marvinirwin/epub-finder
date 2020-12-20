export interface AvailableDocumentDto {
    name: string;
    document_id: string | null;
    id: string;
    uploadDate: Date;
    belongsToUser: boolean;
}