import {Observable, Subscription} from "rxjs";
import {useEffect, useState} from "react";

export function useObs<T>(obs$: Observable<T>, init?: T) {
    const [v, setV] = useState(init);
    const [sub, setSub] = useState<Subscription | undefined>();
    useEffect(() => {
        try {
            if (sub) sub.unsubscribe();
            setSub(obs$.subscribe(newV => {
                // Cheap hack, should do this because its incompatible with init
                setV(typeof newV === 'function' ? () => newV : newV);
            }))
        }catch(e) {
            throw e;
        }
        return function cleanup() {
            if (sub) sub.unsubscribe();
        }
    }, [obs$])
    return v;
}
export function usePipe<T, J>(obs$: J | undefined, pipeFunc: ((v: J) => Observable<T>)): T {
    const [sub, setSub] = useState<Subscription | undefined>();
    const [v, setV] = useState();
    useEffect(() => {
        if (obs$) {
            if (sub) sub.unsubscribe();
            setSub(pipeFunc(obs$).subscribe(val => setV(val)));
        }
        return function cleanup() {
            if (sub)sub.unsubscribe();
        }
    }, [obs$])

    return v;
}