import {SortValue} from "./schedule-row";
import React from "react";

export const DisplaySortValue = ({sortValue}: { sortValue: SortValue<any> }) => {
    return <div style={{marginLeft: '24px'}}>
{/*
        <div>Normal: {sortValue.normalValue}</div>
        <div>Inverse Log: {sortValue.inverseLogNormalValue}</div>
        <div>Weighted Inverse Log: {sortValue.weightedInverseLogNormalValue}</div>
*/}
        <div>Weight: {sortValue.weight}</div>
    </div>
}