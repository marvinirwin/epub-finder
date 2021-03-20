import React, {useEffect, useState} from "react";
import {Observable, Subject} from "rxjs";
import DebugMessage from "../../Debug-Message";
import { Dictionary } from "lodash";
import {useObservableState} from "observable-hooks";

const AllColors: Dictionary<string> = {
    aqua: "#00ffff",
    azure: "#f0ffff",
    beige: "#f5f5dc",
/*
    black: "#000000",
*/
/*
    blue: "#0000ff",
*/
/*
    brown: "#a52a2a",
*/
    cyan: "#00ffff",
/*
    darkblue: "#00008b",
    darkcyan: "#008b8b",
    darkgrey: "#a9a9a9",
    darkgreen: "#006400",
    darkkhaki: "#bdb76b",
    darkmagenta: "#8b008b",
    darkolivegreen: "#556b2f",
*/
    darkorange: "#ff8c00",
    darkorchid: "#9932cc",
/*
    darkred: "#8b0000",
*/
    darksalmon: "#e9967a",
/*
    darkviolet: "#9400d3",
*/
    fuchsia: "#ff00ff",
    gold: "#ffd700",
    green: "#008000",
/*
    indigo: "#4b0082",
*/
    khaki: "#f0e68c",
    lightblue: "#add8e6",
    lightcyan: "#e0ffff",
    lightgreen: "#90ee90",
    lightgrey: "#d3d3d3",
    lightpink: "#ffb6c1",
    lightyellow: "#ffffe0",
    lime: "#00ff00",
    magenta: "#ff00ff",
/*
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
*/
    orange: "#ffa500",
    pink: "#ffc0cb",
/*
    purple: "#800080",
*/
    violet: "#800080",
    red: "#ff0000",
    silver: "#c0c0c0",
    white: "#ffffff",
    yellow: "#ffff00"
}
const ColorArray = Object.values(AllColors)

export function MessageList({messageBuffer$}: {messageBuffer$: Observable<DebugMessage[]>}) {
    const [colors, setColors] = useState<Dictionary<string>>({})
    let [colorIndex, setColorIndex] = useState(0);
    const messageList = useObservableState(messageBuffer$, []);
    useEffect(() => {
        messageList?.forEach(m => {
            if (!colors[m.prefix]) {
                colors[m.prefix] = ColorArray[colorIndex];
                setColors({...colors});
                colorIndex++;
                setColorIndex(colorIndex);
            }
        })
    }, [messageList])

    return <ul className={'message-list'}>
        {messageList && colors && messageList.map(
            (m, i) => {
                const previous = messageList[i + 1];
                const previousTs = previous ? (Number(m.timestamp) - Number(previous.timestamp)) : 0;
                return <li style={{color: colors[m.prefix]}} key={i}>{`${previousTs}ms: ${m.prefix}: ${m.message}`}</li>
            })
        }
    </ul>;
}