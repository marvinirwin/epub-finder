import {Observable} from "rxjs";
import {take} from "rxjs/operators";

export const observableLastValue = <T>(r: Observable<T>): Promise<T> => {
    return r.pipe(take(1)).toPromise()
}