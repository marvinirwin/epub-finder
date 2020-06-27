import {Observable} from "rxjs";
import {useEffect, useState} from "react";

export function useObs<T>(obs$: Observable<T>, init?: T) {
    const [v, setV] = useState(init)
    useEffect(() => {
        try {
            obs$.subscribe(newV => {
                // Cheap hack, should do this because its incompatible with init
                setV(typeof newV === 'function' ? () => newV : newV);
            })
        }catch(e) {
            throw e;
        }
    }, [obs$])
    return v;
}
