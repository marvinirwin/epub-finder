import {PythonShell} from "python-shell";
import {join} from "path";

function setCharAt(str: string, index: number, chr: string) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + chr + str.substring(index + 1);
}


type point = [number, number];
type Neighbor = [number, number, RegExp];


export class PointSet {
    points: number[][] = [];

    constructor(...points: point[]) {
        points.forEach(point => this.add(point));
    }

    add([x, y]: point) {
        if (!this.points[x]) {
            this.points[x] = [];
        }
        this.points[x][y] = 1;
    }

    has([x, y]: point) {
        return (this.points[x] || [])[y];
    }
}

export class AsciiGraph {
    private static resolveAllowedNeighbors(str: string): RegExp {
        if (/([<>^])/.exec(str)) {
            return /[a-z]/;
        }
        if (/[\-|]/.exec(str) || /[a-z]/.exec(str)) {
            return /([<>^\-|])/
        }
        throw new Error(`Cannot resolve neighbors for ${str}`);
    }

    private static resolveNeighborOffsets(str: string): Neighbor[] {
        let pipes : Neighbor[]= [[1, 0, /-/],
            [-1, 0, /-/],
            [0, 1, /\|/],
            [0, -1, /\|/]];
        let endMarkers: Neighbor[] = [
            [1, 0, />/],
            [-1, 0, /</],
            [0, -1, /^/]];
        const letters: Neighbor[] = [
            [1, 0, /[a-z]/],
            [-1, 0, /[a-z]/],
            [0, 1, /[a-z]/],
            [0, -1, /[a-z]/],
        ]
        return [
            ...pipes,
            ...endMarkers,
            ...letters
        ];
        if (/[a-z]/) {
        }
        switch(str) {
            case "-":
        }
    }

    private matrix: string[][];
    edges: { [key: string]: string[] } = {};

    printGraph(p: point) {
        console.log(this.matrix.map((row, rowIndex) => {
            let joined = row.join('');
            if (rowIndex === p[0]) {
                joined = setCharAt(joined, p[1], 'x')
            }
            return joined;
        }).join('\n'))
    }

    constructor(graph: string) {
        this.matrix = graph.split('\n').map(line => line.split('')).filter(row => row.length);

        this.matrix.forEach((row, rowIndex) => row.forEach((cell, cellIndex) => {
            if (AsciiGraph.isNode(cell)) {
                // Now Get all start nodes around me
                this.followEdge(
                    this.getCharAtPoint([rowIndex, cellIndex]) as string,
                    [rowIndex, cellIndex], new PointSet([rowIndex, cellIndex]), true
                )
            }
        }));
    }

    private static isNode(cell: string) {
        return /[a-z]/.exec(cell);
    }

    getCharAtPoint([row, cell]: point): string | undefined {
        return (this.matrix[row] || [])[cell];
    }

    getNeighbors(
        [row, cell]: point,
        neighborOffsets: Neighbor[],
        s: PointSet,
    ) {
        const neighborPoints: point[] = [];
        const currentChar = this.getCharAtPoint([row, cell]) as string;
        let allowedNeighbors = AsciiGraph.resolveAllowedNeighbors(currentChar);
        neighborOffsets.map(
            ([cellOffset, rowOffset, matcher]) => {
                const c = currentChar;
                const neighborPosition: point = [rowOffset + row, cellOffset + cell];
                const neighborCharacter = this.getCharAtPoint(neighborPosition) || '';
                let exec = allowedNeighbors.exec(neighborCharacter);
                if (exec) {
                    if (matcher.exec(neighborCharacter)) {
                        if (s.has(neighborPosition)) return;
                        s.add(neighborPosition);
                        neighborPoints.push(neighborPosition);
                    }
                }
            }
        );
        return neighborPoints
    }

    followEdge(node: string, currentPos: point, s: PointSet, start: boolean) {
        this.printGraph(currentPos);
        const neighbors = this.getNeighbors(currentPos, AsciiGraph.resolveNeighborOffsets(this.getCharAtPoint(currentPos) as string), s);
        // Now we've got a list of things
        neighbors.forEach((neighborPoint) => {
            let charAtPoint = this.getCharAtPoint(neighborPoint);
            if (/[a-z]/.exec(charAtPoint || '')) {
                if (!this.edges[node]) this.edges[node] = [];
                this.edges[node].push(charAtPoint || '');
                return;
            }
            this.followEdge(node, neighborPoint, s, false)
        })
    }


}


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