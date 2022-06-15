import { Observable } from "rxjs";
import React, { useEffect, useState } from "react";
import { useSubscription } from "observable-hooks";
import { EmittedValues } from "./EmittedValues.component";

let idCounter = 0;
export type EmittedValue<U> = { id: number, value: U, formatFn?: (t: U) => string };

export const useVisibleObservableState = <U, T extends Observable<U> = Observable<U>>(observable$: T, formatFn?: (t: U) => string): EmittedValue<U>[] => {
  const [emittedValues, setEmittedValues] = useState<EmittedValue<U>[]>([]);
  const [unMounted, setUnMounted] = useState(false);
  useEffect(() => {
    return () => {
      setUnMounted(true);
    };
  });
  useSubscription(observable$, value => {
    // Maybe add a timestamp too?
    const mewEmittedValue = { id: idCounter++, value, formatFn };
    setEmittedValues(currentEmittedValues => currentEmittedValues.concat(mewEmittedValue));
    setTimeout(() => {
      if (!unMounted) {
        setEmittedValues(currentEmittedValues => currentEmittedValues);
      }
    }, 5000);

  });
  return emittedValues;
};

export const EmittedValuesWithRef = (
  {
    ref,
    emittedValues
  }: { ref: HTMLElement | null, emittedValues: EmittedValue<any>[] }) => {
  return ref ? <EmittedValues emittedValues={emittedValues} style={{top: ref.clientTop, left: ref.clientLeft}}/> : null
};

