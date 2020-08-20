import {safePush} from "../Util/GetGraphJson";
import {convertGraphToOrderables} from "../Util/ConvertGraphToOrderables";
import {AsciiGraph} from "../Util/ASCIIGraph";

export type CausallyOrderable = {
    error?: any,
    value?: any,
    notification?: any,
    nodeLabel?: string,
    next?: any
    ancestors: CausallyOrderable[],
};


export function prefixValueMap(valueMap: ValueMap, prefix: string): ValueMap {
    return Object.fromEntries(Object.entries(valueMap).map(([k, v]) => [`${prefix}.${k}`, v]))
}

export function prefixAdjList(adjList: AdjList, prefix: string): AdjList {
    return Object.fromEntries(Object.entries(adjList).map(([node, edges]) => [
        `${prefix}.${node}`, edges.map(edge => `${prefix}.${edge}`)
    ]))
}

export function reverseAdjList(adjList: AdjList): AdjList {
    const reversedAdjList: AdjList = {};
    Object.entries(adjList).map(([source, destinations]) => {
        destinations.forEach(destination => {
            safePush(reversedAdjList, destination, source)
        });
    });
    return reversedAdjList;
}

export type AdjList = { [key: string]: string[] };

export type ValueMap = { [key: string]: any };

export function getRootsFromAdjList(inAdj: AdjList): string[] {
    const roots = new Set<string>();
    const nodes = new Set<string>();
    Object.keys(inAdj).forEach(node => {
        nodes.add(node);
        (inAdj[node] || []).forEach(child => nodes.add(child));
    });
    nodes.forEach(node => inAdj[node] ? null : roots.add(node))

    const ret: string[] = [];
    roots.forEach(root => ret.push(root));
    return ret;
}

export function invertAdjList(adjList: AdjList): AdjList {
    return Object.entries(adjList).reduce( (acc: {[key: string]: string[]},[source, destinations]) => {
        destinations.forEach(destination => safePush(acc, destination, source));
        return acc;
    }, {});
}

