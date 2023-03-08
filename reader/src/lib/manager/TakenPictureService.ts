import { ReplaySubject } from "rxjs";

export class TakenPictureService {
    currentPicture$ = new ReplaySubject<File | undefined>(1);
    constructor() {
    }
}