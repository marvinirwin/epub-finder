import {Observable} from "rxjs";
import {BookFrame} from "../BookFrame/BookFrame";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {map} from "rxjs/operators";
import {DeltaScanner, ds_Dict} from "../Util/DeltaScanner";

export class ViewingFrameManager {
    framesInView = new DeltaScanner<BookFrame, 'root'>();
    elementsInView: DeltaScanner<Observable<ds_Dict<IAnnotatedCharacter[]>>>;

    constructor() {
        this.elementsInView = this.framesInView
            .mapWith((bookFrame: BookFrame) => bookFrame
                .textData$
                .pipe(map(({wordElementsMap}) => wordElementsMap))
            );
    }
}