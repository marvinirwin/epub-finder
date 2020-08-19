import {AdjList, causallyOrderable, ValueMap} from "../Graph/CasuallyOrderable";

function safeGet(obj: {[key: string]: any}, key: string) {
    if (!obj.hasOwnProperty(key)) {
        throw new Error(`Could not find prop ${key}`)
    }
    return obj[key];
}

export function convertGraphToOrderables(
    edges: AdjList,
    valueMap: ValueMap,
    node: string,
    visited: Set<string> = new Set()
): causallyOrderable {
    visited.add(node);
    const next = /(.*?).next\((.*?)\)/.exec(node);

    if (next) {
        const [_, observable, valueBeingEmitted] = next;
        let valueMapElement = safeGet(valueMap, observable);
        let valueMapElement1 = safeGet(valueMap, valueBeingEmitted);
        return {
            value: valueMapElement,
            next: valueMapElement1,
            ancestors: (edges[node] || []).filter(ancestor => !visited.has(ancestor)).map(ancestor => convertGraphToOrderables(
                edges,
                valueMap,
                ancestor,
                visited
            ))
        }
    } else {
        return {
            value: valueMap[node] || node,
            ancestors: (edges[node] || []).filter(ancestor => !visited.has(ancestor)).map(ancestor => convertGraphToOrderables(
                edges,
                valueMap,
                ancestor,
                visited
            ))
        }
    }
}