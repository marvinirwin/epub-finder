import {Observable} from "rxjs";
import {useEffect, useState} from "react";

export function useObs<T>(obs$: Observable<T>, init?: T) {
    const [v, setV] = useState(init)
    useEffect(() => {
        obs$.subscribe(newV => {
            setV(newV);
        })
    }, [obs$])
    return v;
}
