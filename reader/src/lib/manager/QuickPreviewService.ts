import { ReplaySubject } from "rxjs";

export class QuickPreviewService {
    quickPreviewDocumentUrl$ = new ReplaySubject<string>(1);
}