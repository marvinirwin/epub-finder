import {Manager} from "../../lib/Manager";
import {observableLastValue, SettingsService} from "../../services/settings.service";

export class BookCheckingOutService {
    private settingsService: SettingsService;
    constructor({settingsService}: {settingsService: SettingsService}) {
        this.settingsService = settingsService;
    }

    async checkoutBook (titleBeingCheckedOut: string) {
        const checkedOutBooks = {...await observableLastValue(this.settingsService.checkedOutBooks$)};
        checkedOutBooks[titleBeingCheckedOut] = true;
        this.settingsService.readingBook$.next(titleBeingCheckedOut);
    }

    async returnBook (titleBeingReturned: string)  {
        const checkedOutBooks = {...await observableLastValue(this.settingsService.checkedOutBooks$)};
        delete checkedOutBooks[titleBeingReturned];
        this.settingsService.checkedOutBooks$.next(checkedOutBooks)
    }
}