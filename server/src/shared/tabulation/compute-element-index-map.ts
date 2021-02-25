import {XMLDocumentNode} from "../XMLDocumentNode";

/**
 * Assigns every element an index, which will function as its "path" and a list of these paths will become a "section"
 * @param d
 */
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
    // @ts-ignore
    walk(d.documentElement);
    return m;
}