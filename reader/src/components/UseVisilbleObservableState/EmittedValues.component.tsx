import React, { useContext, useState } from "react";
import { ShowObservableContext } from "../main";
import { EmittedValuesProps } from "./EmittedValuesProps";

const defaultLinesVisible = 8;


export function getJSONLocalStorageValue<T>(key: string, defaultValue: T) {
  try {
    const v = JSON.parse(localStorage.getItem(key) || "");
    return v;
  } catch(e) {
    return defaultValue;
  }
}

function getLinesVisibleKey(key: string) {
  return `EMITTED_VALUES_LINES_VISIBLE_${key}`;
}

export const getLinesVisible = (key: string) => {
  const linesVisibleKey = getLinesVisibleKey(key);
  return getJSONLocalStorageValue<number>(linesVisibleKey, defaultLinesVisible);
}

export const EmittedValues = ({
                                emittedValues,
                                style,
                                id
                              }: EmittedValuesProps) => {
  const showObservables = useContext(ShowObservableContext);
  const [ linesVisible, setLinesVisible ] = useState<number>(getLinesVisible(id))
  {/* TODO add an expand button  */}
  const onClickSetLinesVisible = (n: number) => {
    setLinesVisible(n);
    localStorage.setItem(getLinesVisibleKey(id), JSON.stringify(n))
  }
  return showObservables ?
    <div>
      <ol style={{ position: "absolute", backgroundColor: "lightgrey", borderRadius: 5, padding: 24, ...(style || {}), zIndex: 100 }} >
      {emittedValues.slice(0, linesVisible ).map(({ id, value, formatFn }) => <li
        style={{ lineHeight: "20px" }}
        key={id}>{formatFn ? formatFn(value) : value ? `${value}` : `${id}`}</li>)}
    </ol>
      <button onClick={() => {
        onClickSetLinesVisible(linesVisible + 1)
      }
      }>Add 1 more line </button>
      <button onClick={() => onClickSetLinesVisible(linesVisible - 1 >= 0 ? linesVisible - 1 : 0)}>Hide 1 more line</button>
    </div> : null;
};