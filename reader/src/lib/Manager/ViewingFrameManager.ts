import {Observable} from "rxjs";
import {OpenBook} from "../BookFrame/OpenBook";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {map} from "rxjs/operators";
import {DeltaScanner, ds_Dict} from "../Util/DeltaScanner";

export class ViewingFrameManager {
    framesInView = new DeltaScanner<OpenBook, 'root'>();
    elementsInView: DeltaScanner<Observable<ds_Dict<IAnnotatedCharacter[]>>>;

    constructor() {
        this.elementsInView = this.framesInView
            .mapWith((bookFrame: OpenBook) => bookFrame
                .textData$
                .pipe(map(({wordElementsMap}) => wordElementsMap))
            );
    }
}