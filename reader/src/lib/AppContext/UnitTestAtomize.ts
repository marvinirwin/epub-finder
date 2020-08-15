import {GetWorkerResults} from "../Util/GetWorkerResults";
import {BookFrame} from "../BookFrame/BookFrame";
import {from, Observable, of} from "rxjs";
import {Website} from "../Website/Website";
import {map} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLSerializer} from "xmldom";

export function UnitTestAtomize(page: Website): Observable<BookFrame> {
    return page.getSrc(page.url)
        .pipe(
            map(src => new BookFrame(
                (new XMLSerializer()).serializeToString(AtomizedDocument.atomizeDocument(src).document),
                page.name
                )
            )
        )
}