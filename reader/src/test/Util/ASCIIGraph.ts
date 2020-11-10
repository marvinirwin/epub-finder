import {PointMap} from "./PointMap";
import {BoundingBox, Neighbor, nodeRegexp, Point, safePush, setCharAt} from "./GetGraphJson";
import {convertGraphToOrderables} from "./ConvertGraphToOrderables";
import {CausallyOrderable, getRootsFromAdjList, ValueMap} from "../Graph/CasuallyOrderable";

export class AsciiGraph {
    private static resolveAllowedNeighbors(str: string): RegExp {
        if (/([<>^])/.exec(str)) {
            return nodeRegexp;
        }
        if (/[\-|]/.exec(str) || nodeRegexp.exec(str)) {
            return /([<>^\-|])/
        }
        throw new Error(`Cannot resolve neighbors for ${str}`);
    }

    private static neighborOffsets(): Neighbor[] {
        const pipes: Neighbor[] = [[1, 0, /-/],
            [-1, 0, /-/],
            [0, 1, /\|/],
            [0, -1, /\|/]];
        const endMarkers: Neighbor[] = [
            [1, 0, />/],
            [-1, 0, /</],
            [0, -1, /^/]];
        const letters: Neighbor[] = [
            [1, 0, nodeRegexp],
            [-1, 0, nodeRegexp],
            [0, 1, nodeRegexp],
            [0, -1, nodeRegexp],
        ]
        return [
            ...pipes,
            ...endMarkers,
            ...letters
        ];
    }

    private static isPartOfNode(cell: string) {
        return nodeRegexp.exec(cell);
    }

    /**
     * Assume points are left to right, but its not difficult to make this function handle that
     * @param startRow
     * @param startCell
     * @param endRow
     * @param endCell
     */
    private static getBoundingBoxPoints([[startRow, startCell], [endRow, endCell]]: BoundingBox) {
        // Assume the first one is the start one
        const rowDiff = endRow - startRow;
        const cellDiff = endCell - startCell;
        const pointsInside = [];
        for (let startRowOffset = rowDiff; startRowOffset >= 0; startRowOffset--) {
            for (let startCellOffset = cellDiff; startCellOffset >= 0; startCellOffset--) {
                pointsInside.push([startRow + startRowOffset, startCell + startCellOffset]);
            }
        }
        return pointsInside;
    }

    private static isInsideBoundingBox(b: BoundingBox | Point) {

    }

    public edges: { [key: string]: string[] } = {};

    private pointMap: PointMap;

    private matrix: string[][];

    constructor(graph: string) {
        // @ts-ignore
        const edgesToFollow = [];
        this.pointMap = new PointMap();
        this.matrix = graph.split('\n').map(line => line.split('')).filter(row => row.length);
        this.matrix.forEach((row, rowIndex) => {
            for (let cellIndex = 0; cellIndex < row.length; cellIndex++) {
                const cell = row[cellIndex];
                if (AsciiGraph.isPartOfNode(cell)) {
                    // Now Get all start nodes around me
                    let nodeName = '';
                    const pointMapOfThisNode = new PointMap()
                    const bbStart: Point = [rowIndex, cellIndex];
                    let bbEnd: Point = [rowIndex, cellIndex];
                    while (row[cellIndex] && AsciiGraph.isPartOfNode(row[cellIndex])) {
                        bbEnd = [rowIndex, cellIndex];
                        nodeName += this.getCharAtPoint(bbEnd);
                        pointMapOfThisNode.add(bbEnd);
                        cellIndex++;
                    }

                    pointMapOfThisNode.points.forEach(point => this.pointMap.add(point, nodeName));

                    edgesToFollow.push(
                        [
                            nodeName,
                            [bbStart, bbEnd],
                            pointMapOfThisNode,
                            true
                        ]
                    )
                }
            }
        });

        // @ts-ignore
        edgesToFollow.forEach(a => this.followEdge(...a))
        /*
                this.followEdge(
                    [nodeName,
                        [bbStart, bbEnd],
                        pointMapOfThisNode,
                        true]
                )
        */
    }

    followEdge(node: string, currentPos: BoundingBox, s: PointMap, start: boolean) {
        /*
                this.printGraph(currentPos);
        */
        const neighbors = this.getNeighbors(
            currentPos,
            AsciiGraph.resolveAllowedNeighbors(this.getCharAtPoint(currentPos[0]) as string),
            s
        );
        neighbors.forEach((neighborPoint) => {
            const charAtPoint = this.getCharAtPoint(neighborPoint);
            if (AsciiGraph.isPartOfNode(charAtPoint as string)) {
                if (!this.edges[node]) this.edges[node] = [];
                const items = this.pointMap.get(neighborPoint);
                this.edges[node].push(items);
                return;
            }
            this.followEdge(node, [neighborPoint, neighborPoint], s, false)
        })
    }

    getNeighbors(
        bb: BoundingBox,
        allowedNeighbors: RegExp,
        s: PointMap,
    ) {
        const neighborPoints: Point[] = [];
        const pointsInsideBB = AsciiGraph.getBoundingBoxPoints(bb);
        pointsInsideBB.forEach(([row, cell]) => {
            AsciiGraph.neighborOffsets().forEach(([cellOffset, rowOffset, matcher]) => {
                const character = this.getCharAtPoint([row, cell]);
                const neighborPosition: Point = [rowOffset + row, cellOffset + cell];
                const neighborCharacter = this.getCharAtPoint(neighborPosition) || '';
                if (s.get(neighborPosition)) return;
                if (allowedNeighbors.exec(neighborCharacter)) {
                    if (matcher.exec(neighborCharacter)) {
                        s.add(neighborPosition);
                        neighborPoints.push(neighborPosition);
                    }
                }
            })
        })
        return neighborPoints
    }

    getCharAtPoint([row, cell]: Point): string | undefined {
        return (this.matrix[row] || [])[cell];
    }

    printGraph(p: Point) {
        console.log(this.matrix.map((row, rowIndex) => {
            let joined = row.join('');
            if (rowIndex === p[0]) {
                joined = setCharAt(joined, p[1], 'x')
            }
            return joined;
        }).join('\n'))
    }

    getRoots(): string[] {
        const inAdj = this.edges;
        return getRootsFromAdjList(inAdj);
    }
}