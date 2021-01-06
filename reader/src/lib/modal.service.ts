import {ReplaySubject} from "rxjs";

export class ModalService {

    constructor() {
    }
}

export class Modal {
    test$ = new ReplaySubject<string>(1);
    finished$ = new ReplaySubject<void>(1)
    constructor() {
    }
}


