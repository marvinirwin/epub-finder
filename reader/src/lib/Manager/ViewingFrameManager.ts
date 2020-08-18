import {Observable} from "rxjs";
import {DeltaScanner, DeltaScannerDict, DeltaScannerValueNode} from "../Util/DeltaScanner";
import {BookFrame} from "../BookFrame/BookFrame";
import {IAnnotatedCharacter} from "../Interfaces/Annotation/IAnnotatedCharacter";
import {map} from "rxjs/operators";

export class ViewingFrameManager {
    framesInView = new DeltaScanner<BookFrame>();
    elementsInView = new DeltaScanner<Observable<DeltaScannerDict<IAnnotatedCharacter[]>>>();
    constructor() {
        this.framesInView.updates$.pipe(map(({sourced, delta: {set, remove}}) => {
            // If your frame has been removed, we remove your stuff from the wordElementFrameMap
            Object.entries(remove).map(([removedFrameId, removedFrame]) => {
                // Now we've removed all elements to do with that frame
                this.elementsInView.appendDelta$.next({
                    remove: {
                        [removedFrameId]: {
                            delete: true
                        }
                    }
                });
            })
            Object.entries(set).map(([setFrameId, setFrame]) => {
                // Now we gotta add that frame's stuff to map
                this.elementsInView.appendDelta$.next({
                    set: {
                        [setFrameId]: {
                            value: setFrame.value.textData$.pipe(map(({wordElementsMap}) => wordElementsMap)),
                        }
                    },
                })
            })
        }));
    }
}