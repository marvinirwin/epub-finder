import {Manager} from "../../lib/Manager";

export const checkoutBook = (m: Manager, titleBeingCheckedOut: string) => {
    const checkedOutBooks = {...m.db.checkedOutBooks$.getValue()};
    checkedOutBooks[titleBeingCheckedOut] = true;
    m.db.checkedOutBooks$.next(checkedOutBooks)
}

export const returnBook = (m: Manager, titleBeingReturned: string) => {
    const checkedOutBooks = {...m.db.checkedOutBooks$.getValue()};
    delete checkedOutBooks[titleBeingReturned];
    m.db.checkedOutBooks$.next(checkedOutBooks)
}



