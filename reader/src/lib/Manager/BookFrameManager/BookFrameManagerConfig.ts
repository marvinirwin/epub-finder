import {Website} from "../../Website/Website";
import {Observable} from "rxjs";
import {BookFrame} from "../../BookFrame/BookFrame";

export interface BookFrameManagerConfig {
    getPageRenderer: (website: Website) => Observable<BookFrame>,
}