import {uniq} from "lodash";
import {DeltaScan, ds_Dict, flattenTree} from "../lib/delta-scan/delta-scan.module";
import {Observable} from "rxjs";
import {map, shareReplay} from "rxjs/operators";
import {Named} from "../../../server/src/shared/named.type";

export type ds_Tree<T, U extends string = string> = {
    value?: T;
    children?: ds_Dict<ds_Tree<T, U>>
    nodeLabel: U | 'root';
    delete?: boolean;
    // When applying a tree diff, you may want to say "Disregard all previous changes to this tree"
    newTree?: boolean;
}

export const walkTree = <T>(t: ds_Tree<T>, ...path: string[]): ds_Tree<T> | undefined => {
    if (!path.length) return t;
    if (!t.children?.[path[0]]) {
        throw new Error(`No child under ${t.nodeLabel} with label ${path[0]}`)
    }
    return walkTree(t.children[path[0]], ...path.slice(1));
}

export const treeValue = <T>(t: ds_Tree<T>, ...path: string[]) => {
    return walkTree(t, ...path)?.value;
}

/**
 * Maybe I should return a tree of deltas once I apply
 * Not now though
 * @param oldTree
 * @param diffTree
 */
export function applyTreeDiff<T>(oldTree: ds_Tree<T> | undefined, diffTree: ds_Tree<T> | undefined): ds_Tree<T> | undefined {
    if (!oldTree && !diffTree) return undefined;
    if (!oldTree) return diffTree;
    if (!diffTree) return oldTree;
    if (diffTree?.delete) return undefined;
    if (diffTree.newTree) return diffTree;
    const allChildKeys = uniq(Object.keys(oldTree.children || {}).concat(Object.keys(diffTree.children || {})))
    const newChildren = Object.fromEntries(
        allChildKeys.map(key => {
                const oldTreeChild = oldTree.children?.[key];
                const newTreeChild = diffTree.children?.[key];
                const childNode = applyTreeDiff(oldTreeChild, newTreeChild);
                return [key, childNode];
            }
        ).filter(([key, childNode]) => childNode)
    );

    const ret: ds_Tree<T> = {
        nodeLabel: diffTree.nodeLabel,
        children: newChildren,
    };

    if (diffTree.hasOwnProperty('value')) {
        ret.value = diffTree.value;
    }
    return ret;

    /*
        oldTree.value = diffTree.value;
        // I could do it by returing new Nodes, but that might be slow?
        // Either way is pretty easy
        const newTreeChildren = diffTree.children || {};
        const oldTreeChildren = oldTree.children || {};
        Object.entries(newTreeChildren).forEach(([key, newNode]) => {
            // Assert the child exists, this part wouldn't exist if we were doign the new instantiating way, but screw it
            if (!oldTreeChildren[key]) {
                oldTreeChildren[key] = {
                    value: newNode.value,
                    children: {},
                    nodeLabel: newNode.nodeLabel
                };
            }
            applyTreeDiff(oldTreeChildren[key], newTreeChildren[key])
        })
    */
}

export const flattenTreeIntoDict = (key?: string) =>
    <T extends Named, U extends string>(obs$: Observable<DeltaScan<T, U>>): Observable<ds_Dict<T>> => {
        return obs$.pipe(
            map(({sourced}) => {
                const libraryDocuments = key === undefined ?
                    sourced :
                    sourced?.children?.[key];
                return Object.fromEntries(
                    libraryDocuments ? flattenTree<T>(
                        libraryDocuments
                    ).map(document => [document.name, document]) : []
                );
            }),
            shareReplay(1)
        );
    }



export type TreeConstructor<T> = [string, T, ...TreeConstructor<T>[]]
export const constructTree = <T>(...t: TreeConstructor<T>): ds_Tree<T> => {
    const [nodeLabel, value, ...children] = t;
    return {
        nodeLabel,
        value,
        children: Object.fromEntries(
            (children || []).map(constructor => [constructor[0], constructTree(...constructor)])
        )
    };
}