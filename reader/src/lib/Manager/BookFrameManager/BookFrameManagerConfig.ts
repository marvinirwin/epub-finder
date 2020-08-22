import {Website} from "../../Website/Website";
import {Observable} from "rxjs";
import {OpenBook} from "../../BookFrame/OpenBook";

export interface BookFrameManagerConfig {
    getPageRenderer: (website: Website) => Observable<OpenBook>,
}