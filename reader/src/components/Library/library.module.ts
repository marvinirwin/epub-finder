import {Manager} from "../../lib/Manager";

export const checkoutBook = (m: Manager, titleBeingCheckedOut: string) => {
/*
    const checkedOutBooks = {...m.settingsService.checkedOutBooks$.getValue()};
    checkedOutBooks[titleBeingCheckedOut] = true;
*/
    m.settingsService.checkedOutBooks$.next({[titleBeingCheckedOut]: true})
}

export const returnBook = (m: Manager, titleBeingReturned: string) => {
    const checkedOutBooks = {...m.settingsService.checkedOutBooks$.getValue()};
    delete checkedOutBooks[titleBeingReturned];
    m.settingsService.checkedOutBooks$.next(checkedOutBooks)
}



