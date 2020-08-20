import {isObject} from "lodash";
import {CausallyOrderable} from "./CasuallyOrderable";
import {ignoreElements} from "rxjs/operators";

export type CompareFn = (tree: CausallyOrderable, subTree: CausallyOrderable) => boolean;

export function isSubObject(superObject: any, subObject: any, ignoreKeys = new Set<string>()): boolean {
    if (Array.isArray(superObject) && Array.isArray(subObject)) {
        return subObject.every((child, index) => isSubObject(superObject[index], child))
    }
    if (isObject(superObject) && isObject(subObject)) {
        return Object.entries(subObject).filter(([k]) => !ignoreKeys.has(k)).every(([key, value]) => isSubObject(
            (superObject as { [key: string]: any })[key],
            (subObject as { [key: string]: any })[key])
        )
    }
    return superObject === subObject;
}

export function OrderingCompareFn(actualRoots: CausallyOrderable[], expectedRoots: CausallyOrderable[]) {
    expect(actualRoots.length).toBeGreaterThan(0);
    let actual = expectedRoots
        .every(expectedRoot => {
                return actualRoots
                    .find(actualRoot => {
                        return isSubTree(
                            actualRoot,
                            expectedRoot,
                            isSubObject,
                            new Set<string>(['nodeLabel'])
                        );
                    });
            }
        );
    if (!actual) {
        console.log();
    }
    expect(actual).toBeTruthy();
}

export function isSubTree(
    tree: CausallyOrderable,
    subTree: CausallyOrderable,
    compareFn: CompareFn,
    ignoreKeys: Set<string>)
    : boolean {
    if (!tree || !subTree) return false;
    let treeContainsSubTree = treeSubSet(tree, subTree, compareFn);
    let treeHasChildWhichIsEqual = tree.ancestors.find(ancestor => {
        return isSubTree(ancestor, subTree, compareFn, ignoreKeys);
    });
    return treeContainsSubTree ||
        !!treeHasChildWhichIsEqual
        ;
}

export function treeSubSet(tree: CausallyOrderable, subTree: CausallyOrderable, compareFn: CompareFn): boolean {
    if (!tree && !subTree) {
        return true;
    }
    if (!tree && subTree) {
        return false;
    }
    if (!tree && !subTree) {
        return false;
    }

    return compareFn(tree, subTree) &&
        subTree.ancestors.every(subTreeAncestor =>
            tree.ancestors.find(treeAncestor =>
                treeSubSet(treeAncestor, subTreeAncestor, compareFn)
            )
        )
}

