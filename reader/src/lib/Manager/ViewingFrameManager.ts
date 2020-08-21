import {Observable} from "rxjs";
import {BookFrame} from "../BookFrame/BookFrame";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {map} from "rxjs/operators";
import {DeltaScanner} from "../Util/DeltaScanner";

export class ViewingFrameManager {
    framesInView = new DeltaScanner.DeltaScanner<BookFrame, 'root'>();
    elementsInView: DeltaScanner.DeltaScanner<Observable<DeltaScanner.Dict<IAnnotatedCharacter[]>>>;

    constructor() {
        this.elementsInView = this.framesInView
            .mapWith((bookFrame: BookFrame) => bookFrame
                .textData$
                .pipe(map(({wordElementsMap}) => wordElementsMap))
            );
    }
}