import {MenuNode} from "./menu-node";

export class IconActionNode {
    constructor(key: string, public opts: {
        label: string,
        leftIcon?: string,
        action: () => void
    }) {
    }
}