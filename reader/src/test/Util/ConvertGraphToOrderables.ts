import {AdjList, CausallyOrderable, ValueMap} from "../Graph/CasuallyOrderable";

function safeGet(obj: {[key: string]: any}, key: string, defaultValue?: string) {
    if (!obj.hasOwnProperty(key)) {
        if (arguments.length === 3) {
            return arguments[2];
        }
        throw new Error(`Could not find prop ${key}`)
    }
    return obj[key];
}

export function convertGraphToOrderables(
    edges: AdjList,
    valueMap: ValueMap,
    node: string,
    visited: Set<string> = new Set()
): CausallyOrderable {
    visited.add(node);
    const next = /(.*?).next\((.*?)\)/.exec(node);

    if (next) {
        const [_, observableLabel, valueBeingEmittedLabel] = next;
        let observable = safeGet(valueMap, observableLabel);
        let valueBeingEmitted = safeGet(valueMap, valueBeingEmittedLabel, valueBeingEmittedLabel);
        return {
            value: observable,
            next: valueBeingEmitted,
            ancestors: (edges[node] || []).filter(ancestor => !visited.has(ancestor)).map(ancestor => convertGraphToOrderables(
                edges,
                valueMap,
                ancestor,
                visited
            )),
            nodeLabel: node,
        }
    } else {
        return {
            value: valueMap[node] || node,
            ancestors: (edges[node] || []).filter(ancestor => !visited.has(ancestor)).map(ancestor => convertGraphToOrderables(
                edges,
                valueMap,
                ancestor,
                visited
            )),
            nodeLabel: node,
        }
    }
}