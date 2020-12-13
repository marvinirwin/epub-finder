import {Manager} from "../../lib/Manager";
import {replaySubjectLastValue, SettingsService} from "../../services/settings.service";

export class BookCheckingOutService {
    private settingsService: SettingsService;
    constructor({settingsService}: {settingsService: SettingsService}) {
        this.settingsService = settingsService;
    }

    async checkoutBook (titleBeingCheckedOut: string) {
        const checkedOutBooks = {...await replaySubjectLastValue(this.settingsService.checkedOutBooks$)};
        checkedOutBooks[titleBeingCheckedOut] = true;
        this.settingsService.readingBook$.next(titleBeingCheckedOut);
    }

    async returnBook (titleBeingReturned: string)  {
        const checkedOutBooks = {...await replaySubjectLastValue(this.settingsService.checkedOutBooks$)};
        delete checkedOutBooks[titleBeingReturned];
        this.settingsService.checkedOutBooks$.next(checkedOutBooks)
    }
}