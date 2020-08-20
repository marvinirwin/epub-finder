import {safePush} from "../Util/GetGraphJson";
import {convertGraphToOrderables} from "../Util/ConvertGraphToOrderables";
import {AsciiGraph} from "../Util/ASCIIGraph";

export type causallyOrderable = {
    error?: any,
    value?: any,
    notification?: any,
    next?: any
    ancestors: causallyOrderable[],
};


export function prefixValueMap(valueMap: ValueMap, prefix: string): ValueMap {
    return Object.fromEntries(Object.entries(valueMap).map(([k, v]) => [`${prefix}.${k}`, v]))
}

export function prefixAdjList(adjList: AdjList, prefix: string): AdjList {
    return Object.fromEntries(Object.entries(adjList).map(([node, edges]) => [
        `${prefix}.${node}`, edges.map(edge => `${prefix}.${edge}`)
    ]))
}

export function toAdjList(roots: causallyOrderable[]) {

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

export function invertCausallyOrderable(roots: causallyOrderable[]) {

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

export function rootsToCausallyOrderable(roots: string[], valueMap: ValueMap, adjList: AdjList): causallyOrderable[] {
}

export function adjListToRoots() {

}

export function getOrderables(s: string, valueMap: ValueMap): { lastEmissionRoots: causallyOrderable[], firstEmissionRoots: causallyOrderable[]
}{
    const g = new AsciiGraph(s);
    const rootsAreFirstOccurrances = g.getRoots();
    const rootsAreLastOccurrances = getRootsFromAdjList(invertedEdges);
    // This is confusing as fuck
    // lastEmissionRoots are used for comparing actual/expected at the end of everything
    // firstEmissionRoots are used for walking through the tree during runtime
    // I suppose that lastEmissionRoots is kind of useless, since we already know the test will have passed
    // If we get to the end and the tree walking has not been completed yet
    return {
        lastEmissionRoots: rootsAreFirstOccurrances.map(root => convertGraphToOrderables(invertedEdges, valueMap, root, visited)),
ouyt        // firstEmissionRoots: rootsAreLastOccurrances.map(root => convertGraphToOrderables(g.edges, valueMap, root, visited))
    };
}
