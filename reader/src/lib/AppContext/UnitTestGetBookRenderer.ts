import {OpenBook} from "../BookFrame/OpenBook";
import {Observable} from "rxjs";
import {Website} from "../Website/Website";
import {map} from "rxjs/operators";
import {AtomizedDocument} from "../Atomized/AtomizedDocument";
import {XMLSerializer} from "xmldom";
import {InMemoryBookRenderer} from "../BookFrame/Renderer/InMemoryBookRenderer";
import {TrieWrapper} from "../TrieWrapper";

export function UnitTestGetBookRenderer(
    page: Website,
    trie$: Observable<TrieWrapper>
): Observable<OpenBook> {
    try {
        return page.getSrc(page.url).pipe(
            map(src => {
                    return new OpenBook(
                        (new XMLSerializer()).serializeToString(AtomizedDocument.atomizeDocument(src).document),
                        page.name,
                        new InMemoryBookRenderer(),
                        trie$
                    );
                }
            )
        );
    }catch(e) {
        console.error(e);
        throw e;
    }
}