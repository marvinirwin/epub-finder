import {Manager} from "../../lib/Manager";
import {replaySubjectLastValue} from "../../services/settings.service";

export const checkoutBook = (m: Manager, titleBeingCheckedOut: string) => {
/*
    const checkedOutBooks = {...m.settingsService.checkedOutBooks$.getValue()};
    checkedOutBooks[titleBeingCheckedOut] = true;
*/
    m.settingsService.checkedOutBooks$.next({[titleBeingCheckedOut]: true})
}

export const returnBook = async (m: Manager, titleBeingReturned: string) => {
    const checkedOutBooks = {...await replaySubjectLastValue(m.settingsService.checkedOutBooks$)};
    delete checkedOutBooks[titleBeingReturned];
    m.settingsService.checkedOutBooks$.next(checkedOutBooks)
}



