import {CheckedOutBooksService} from "../book-lists/checked-out-books.service";
import {AvailableBooksService} from "../book-lists/available-books.service";
import {OpenBooksService} from "../Manager/open-books.service";
import {BookSelectionRowInterface} from "./book-selection-row.interface";
import {combineLatest, Observable} from "rxjs";
import {SettingsService} from "../../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import { keyBy } from "lodash";

export class BookSelectionService {
    bookSelectionRows$: Observable<BookSelectionRowInterface[]>;
    constructor({availableBooksService, settingsService}:{
                    availableBooksService: AvailableBooksService, settingsService: SettingsService
    }) {
        this.bookSelectionRows$ = combineLatest([
            availableBooksService.available$,
            settingsService.checkedOutBooks$,
            settingsService.readingBook$
        ]).pipe(
            map(([available, checkedOut, reading]) => {
                const all: BookSelectionRowInterface[] = [
                    ...available
                        .map(({name}) => ({name})),
                    ...Object.entries(checkedOut)
                        .filter(([name, checkedOut]) => checkedOut )
                        .map(([name]) => ({
                            name, open: true,
                        })),
                ];
                if (reading) {
                    all.push({name: reading, open: true, reading: true})
                }
                // Get the latest version for each name
                return Object.values(keyBy(all, 'name'))
            }),
            shareReplay(1)
        )
    }
}