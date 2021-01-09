import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";

export const computeElementIndexMap = (d: XMLDocument) => {
    const m = new Map<XMLDocumentNode, number>();
    const walk = (node: XMLDocumentNode, index: number = 0) => {
        m.set(node, index);
        let child: XMLDocumentNode | null = node.firstChild;
        let childIndex = 0;
        while (child) {
            walk(child, childIndex);
            child = child.nextSibling;
            childIndex++;
        }
    }
    walk(d.documentElement as unknown as XMLDocumentNode);
    return m;
}