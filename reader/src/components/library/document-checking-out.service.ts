import {Manager} from "../../lib/Manager";
import {observableLastValue, SettingsService} from "../../services/settings.service";

export class DocumentCheckingOutService {
    private settingsService: SettingsService;
    constructor({settingsService}: {settingsService: SettingsService}) {
        this.settingsService = settingsService;
    }

    async setReadingDocument (titleBeingCheckedOut: string) {
/*
        const checkedOutDocuments = {...await observableLastValue(this.settingsService.checkedOutDocuments$)};
        checkedOutDocuments[titleBeingCheckedOut] = true;
*/
        this.settingsService.readingDocument$.next(titleBeingCheckedOut);
    }

    async returnDocument (titleBeingReturned: string)  {
        const checkedOutDocuments = {...await observableLastValue(this.settingsService.checkedOutDocuments$)};
        delete checkedOutDocuments[titleBeingReturned];
        this.settingsService.checkedOutDocuments$.next(checkedOutDocuments)
    }
}