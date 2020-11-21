import {CustomBookDto} from "./custom-book.dto";

export interface AvailableBooksDto {
    files: string[];
    custom: CustomBookDto[];
}