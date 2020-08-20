import {flatten, uniqueId} from "lodash";
import {convertGraphToOrderables} from "../Util/ConvertGraphToOrderables";
import {
    AdjList,
    causallyOrderable,
    getRootsFromAdjList,
    prefixAdjList,
    prefixValueMap,
    reverseAdjList,
    rootsToCausallyOrderable,
    ValueMap
} from "./CasuallyOrderable";


export function mergeAdjacencyLists(...adjLists: AdjList[]) {
    const l: AdjList = {};
    adjLists.forEach(
        adjList => Object.entries(adjList)
            .forEach(([k, v]) =>
                // There should never be any duplicates
                l[k] = (l[k] || []).concat(v)
            )
    );
    return l;
}

export class CausalTree {
    public ancestors: CausalTree[] = [];

    constructor(
        private adjListThatMovesForwardInTime: AdjList,
        public valueMap: ValueMap
    ) {
    }

    /**
     * Am I sure this gets roots by forward in time?
     */
    getCasualGraphForwardInTime(): causallyOrderable[] {
        const visited = new Set<string>();
        return getRootsFromAdjList(this.adjListThatMovesForwardInTime)
            .map(root => convertGraphToOrderables(this.adjListThatMovesForwardInTime, this.valueMap, root, visited));
    }

    /**
     * Am I sure this gets roots by backwards in time?
     */
    getCausalGraphBackwardInTime(): causallyOrderable[] {
        const visited = new Set<string>();
        return getRootsFromAdjList(this.getAdjListThatMovesBackwardsInTime())
            .map(root => convertGraphToOrderables(this.adjListThatMovesForwardInTime, this.valueMap, root, visited));
    }

    getAdjListThatMovesBackwardsInTime(): AdjList {
        return reverseAdjList(this.adjListThatMovesForwardInTime);
    }

    getAdjListThatMovesForwardsInTime(): AdjList {
        return this.adjListThatMovesForwardInTime;
    }

    /**
     * TODO this and the one below might be mis-named
     * While at the same time working
     */
    getRootsWhichAreFirstOccurrances(): string[] {
        return getRootsFromAdjList(this.getAdjListThatMovesForwardsInTime())
    }


    /**
     * TODO this and the one above might be mis-named
     * While at the same time working
     */
    getRootsWhichAreLastOccurrances(): string[]{
        return getRootsFromAdjList(this.getAdjListThatMovesBackwardsInTime())
    }

    getCompressedTree(): CausalTree {
        let myStartNodes = getRootsFromAdjList(this.getAdjListThatMovesBackwardsInTime());
        /**
         * Our adj list going forwards in time will look like this
         *        a     b
         *     c          d
         *       e
         *         f
         * Every ancestor we have will have come before us, so we take the nodes which occur first (a, b)
         * And put an adjacency from them to the last nodes of our ancestors
         */
        const ancestorTrees = this.ancestors.map(ancestor => ancestor.getCompressedTree())
        const endNodesOfAncestorTrees: string[] = flatten(
            ancestorTrees.map(ancestorTree =>
                getRootsFromAdjList(ancestorTree.getCompressedTree().getAdjListThatMovesForwardsInTime())
            )
        );

        // Each one of my first Nodes
        // And each one of my ancestor last nodes
        const connectingAdjLists = myStartNodes.map(firstNode =>
            Object.fromEntries(endNodesOfAncestorTrees.map(lastNodesOfAncestorTree =>
                    [lastNodesOfAncestorTree, [firstNode]]
                )
            )
        )

        const newAdjacencies = mergeAdjacencyLists(
            ...connectingAdjLists,
            this.getAdjListThatMovesForwardsInTime(),
            ...ancestorTrees.map(ancestorTree => ancestorTree.getCompressedTree().getAdjListThatMovesForwardsInTime())
        );

        const newValueMap = Object.assign(
            {},
            this.valueMap,
            ...ancestorTrees.map(ancestorTree => ancestorTree.getCompressedTree().valueMap)
        );
        return new CausalTree(
            newAdjacencies,
            newValueMap
        )
    }

    getFirstEmissionRoots(): causallyOrderable[] {
        const visited = new Set<string>();
        return this.getRootsWhichAreLastOccurrances()
            .map(root => convertGraphToOrderables(
                this.getAdjListThatMovesForwardsInTime(),
                this.valueMap,
                root,
                visited
                )
            )
    }
    getLastEmissionRoots(): causallyOrderable[] {
        const visited = new Set<string>();
        return this.getRootsWhichAreFirstOccurrances()
            .map(root => convertGraphToOrderables(
                this.getAdjListThatMovesForwardsInTime(),
                this.valueMap,
                root,
                visited
                )
            )
    }
}
