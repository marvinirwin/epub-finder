import {BookFrame} from "../BookFrame/BookFrame";
import {Observable} from "rxjs";
import {Website} from "../Website/Website";
import {map} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLSerializer} from "xmldom";
import {BookFrameRendererInMemory} from "../BookFrame/Renderer/BookFrameRendererInMemory";

export function UnitTestGetPageRenderer(page: Website): Observable<BookFrame> {
    try {
        return page.getSrc(page.url).pipe(
            map(src => {
                    return new BookFrame(
                        (new XMLSerializer()).serializeToString(AtomizedDocument.atomizeDocument(src).document),
                        page.name,
                        new BookFrameRendererInMemory()
                    );
                }
            )
        );
    }catch(e) {
        console.error(e);
        throw e;
    }
}