export interface BookToBeSavedDto {
    book_id?: string;
    name: string;
    html: string;
    deleted?: boolean;
}