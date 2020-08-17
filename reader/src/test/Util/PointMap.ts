import {Point} from "./GetGraphJson";

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