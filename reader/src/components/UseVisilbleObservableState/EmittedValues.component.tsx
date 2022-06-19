import React, { useContext } from "react";
import { ShowObservableContext } from "../main";
import { EmittedValue } from "./UseVisibleObservableState";

export const EmittedValues = ({
                                emittedValues,
                                style
                              }: { emittedValues: EmittedValue<any>[], style?: Record<string, any> }) => {
  const showObservables = useContext(ShowObservableContext);
  return showObservables ? <ol style={{ position: "absolute", backgroundColor: "lightgrey", borderRadius: 5, padding: 24, ...(style || {}) }}>
    {emittedValues.map(({ id, value, formatFn }) => <li
      style={{lineHeight: '20px'}}
      key={id}>{formatFn ? formatFn(value) : value ? `${value}` : `${id}`}</li>)}
  </ol> : null;
};