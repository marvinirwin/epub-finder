import {AvailableBooksService} from "../book-lists/available-books.service";
import {BookSelectionRowInterface} from "./book-selection-row.interface";
import {combineLatest, Observable} from "rxjs";
import {SettingsService} from "../../services/settings.service";
import {map, shareReplay} from "rxjs/operators";
import {keyBy, orderBy} from "lodash";

export class BookSelectionService {
    bookSelectionRows$: Observable<BookSelectionRowInterface[]>;

    constructor({availableBooksService, settingsService}: {
        availableBooksService: AvailableBooksService,
        settingsService: SettingsService
    }) {
        this.bookSelectionRows$ = combineLatest([
            availableBooksService.available$,
            settingsService.checkedOutBooks$,
            settingsService.readingBook$
        ]).pipe(
            map(([available, checkedOut, reading]) => {
                const all: BookSelectionRowInterface[] = [
                    ...available
                        .map(({name, belongsToUser, uploadDate}) => ({
                            name,
                            belongsToCurrentUser: !!belongsToUser,
                            lastModified: uploadDate
                        } as BookSelectionRowInterface)),
                    ...Object.entries(checkedOut)
                        .filter(([name, checkedOut]) => checkedOut)
                        .map(([name]) => ({
                            name,
                            open: true,
                            lastModified: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 10) // placeholder
                        } as BookSelectionRowInterface)),
                ];
                if (reading) {
                    all.push({name: reading, open: true, reading: true, lastModified: new Date()})
                }
                // Get the latest version for each name
                return orderBy(Object.values(keyBy(all, 'name')), ['belongsToCurrentUser', 'lastModified'], ['desc', 'desc'])
            }),
            shareReplay(1)
        )
    }
}