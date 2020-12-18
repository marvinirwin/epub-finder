import {ds_Tree} from "../../services/tree.service";
import {Named} from "../../lib/Manager/open-documents.service";

/**
 * Each one of these things is an observable which returns treeNdoes
 * Each time ones first, the tree is updated
 *
 * There is one more function to make called TreeNodeFromArray<T> which makes a tree out of this
 * Then we can run mapWith to make it a tree of MenuNode<T>
 * But what if the structure has to be modified?
 * Well then there can be an observable of this tree in the first place
 * root$
 * reader$
 * library$
 * [
 *   ...libraryBooks$
 * ]
 * auth$
 * [
 *   ...signInOptions$
 * ]
 */
type ArrayToTreeParams<T extends Named> = [T, ...(T | ArrayToTreeParams<T>)[]] | [];
export const arrayToTreeChildren = <T extends Named>(...array: ArrayToTreeParams<T>): {[key: string]: ds_Tree<T>} => {
    // The first item must be a root, the rest can either be adjacent roots or the children of the most recent one
    const [root, ...nextItems] = array;
    if (!root) {
        return {}
    }
    const entries: [[string, ds_Tree<T>]] = [[root.name, {nodeLabel: root.name, value: root}]]
    for (let i = 0; i < nextItems.length; i++) {
        const nextItem = nextItems[i];
        if (Array.isArray(nextItem)) {
            // These are my children
            const [, currentRoot ] =  entries[entries.length - 1];
            currentRoot.children = arrayToTreeChildren(...nextItem);
        } else {
            entries.push([nextItem.name, {nodeLabel: nextItem.name, value: nextItem}]);
        }
    }
    return Object.fromEntries(entries);
}

export const arrayToTreeRoot = <T extends Named>(...array: [T, ...(T | ArrayToTreeParams<T>)[]]): ds_Tree<T> =>
    Object.values(arrayToTreeChildren(...array))[0]


