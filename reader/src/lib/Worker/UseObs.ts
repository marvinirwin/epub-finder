import {Observable, Subscription} from "rxjs";
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
export function usePipe<T, J>(obs$: J | undefined, pipeFunc: ((v: J) => Observable<T>)): T {
    let sub: Subscription | undefined;
    const [v, setV] = useState();
    useEffect(() => {
        if (obs$) {
            if (sub) sub.unsubscribe();
            sub = pipeFunc(obs$).subscribe(val => setV(val));
        }
    }, [obs$])
    return v;
}
