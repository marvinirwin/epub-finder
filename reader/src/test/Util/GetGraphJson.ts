import {PythonShell} from "python-shell";
import {join} from "path";
import { Dictionary } from "lodash";

type Point = [number, number];

type Neighbor = [number, number, RegExp];

type BoundingBox = [Point, Point];

export const nodeRegexp = /[a-zA-Z.()$]/;

export function getGraphJson(ascii: string) {

    return new Promise((resolve, reject) => {
        const options = {
            pythonPath: 'python3',
            args: [ascii]
        };
        PythonShell.run(
            join(__dirname, '../graph/graph.py'),
            options,
            function (err, results) {
                if (err) reject(err);
                // @ts-ignore
                resolve(JSON.parse(results[0]));
            }
        )
    })
}

export function safePush(inMap: Dictionary<any[]>, key: string, val: any) {
    if (!inMap[key]) inMap[key] = [];
    inMap[key].push(val);
}

export class AsciiGraph {
    private pointMap: PointMap;

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
        let pipes: Neighbor[] = [[1, 0, /-/],
            [-1, 0, /-/],
            [0, 1, /\|/],
            [0, -1, /\|/]];
        let endMarkers: Neighbor[] = [
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

    private matrix: string[][];

    constructor(graph: string) {
        this.matrix = graph.split('\n').map(line => line.split('')).filter(row => row.length);
        this.pointMap = new PointMap();

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

                    this.followEdge(
                        nodeName,
                        [bbStart, bbEnd],
                        pointMapOfThisNode,
                        true
                    )
                }
            }
        });
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
            let charAtPoint = this.getCharAtPoint(neighborPoint);
            if (AsciiGraph.isPartOfNode(charAtPoint as string)) {
                if (!this.edges[node]) this.edges[node] = [];
                this.edges[node].push(this.pointMap.get(neighborPoint));
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

    getRoots() {
        const nodes = new Set<string>();
        const outAdjacencies = this.edges;
        const inAdjacencies: Dictionary<string[]> = Object.entries(outAdjacencies)
            .reduce((inMap, [source, destinations]) => {
                nodes.add(source);
                destinations.forEach(destination => {
                    nodes.add(destination);
                    safePush(inMap, destination, source);
                })
                return inMap;
            }, {});
        const roots = new Set<string>();
        nodes.forEach(node => {
            if (!inAdjacencies[node]) {
                roots.add(node);
            }
        });

        const ret: string[] = [];
        roots.forEach(root => ret.push(root));
        return ret;
    }
}

export class PointMap {
    private pointMap: string[][] = [];
    public points: Point[] = [];

    constructor(...points: Point[]) {
        points.forEach(point => this.add(point));
    }

    add([x, y]: Point, v: string = '1') {
        if (!this.pointMap[x]) {
            this.pointMap[x] = [];
        }
        if (this.pointMap[x][y] === undefined) {
            this.points.push([x, y])
        }
        this.pointMap[x][y] = v;
    }

    get([x, y]: Point) {
        return (this.pointMap[x] || [])[y];
    }
}

function setCharAt(str: string, index: number, chr: string) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}

