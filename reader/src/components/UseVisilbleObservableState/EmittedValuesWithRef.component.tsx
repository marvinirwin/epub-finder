import { EmittedValues } from "./EmittedValues.component";
import React from "react";
import { EmittedValue } from "./UseVisibleObservableState";

export const EmittedValuesWithRef = (
  {
    ref,
    emittedValues,
    id
  }: { ref: HTMLElement | null, emittedValues: EmittedValue<any>[], id: string }) => {
  return ref ?
    <EmittedValues emittedValues={emittedValues} style={{ top: ref.clientTop, left: ref.clientLeft }} id={id} /> : null;
};