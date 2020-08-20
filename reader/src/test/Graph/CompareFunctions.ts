import {isObject} from "lodash";
import {causallyOrderable} from "./CasuallyOrderable";

export type CompareFn = (tree: causallyOrderable, subTree: causallyOrderable) => boolean;

const deepDiffMapper = function () {
    return {
        VALUE_CREATED: 'created',
        VALUE_UPDATED: 'updated',
        VALUE_DELETED: 'deleted',
        VALUE_UNCHANGED: 'unchanged',
        map: function (obj1: any, obj2: any) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw 'Invalid argument. Function given, object expected.';
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                return {
                    type: this.compareValues(obj1, obj2),
                    data: obj1 === undefined ? obj2 : obj1
                };
            }

            var diff: { [key: string]: any } = {};
            for (var key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                var value2 = undefined;
                if (obj2[key] !== undefined) {
                    value2 = obj2[key];
                }

                diff[key] = this.map(obj1[key], value2);
            }
            for (var key in obj2) {
                if (this.isFunction(obj2[key]) || diff[key] !== undefined) {
                    continue;
                }

                diff[key] = this.map(undefined, obj2[key]);
            }

            return diff;

        },
        compareValues: function (value1: any, value2: any) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if (value1 === undefined) {
                return this.VALUE_CREATED;
            }
            if (value2 === undefined) {
                return this.VALUE_DELETED;
            }
            return this.VALUE_UPDATED;
        },
        isFunction: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Function]';
        },
        isArray: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Array]';
        },
        isDate: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Date]';
        },
        isObject: function (x: any) {
            return Object.prototype.toString.call(x) === '[object Object]';
        },
        isValue: function (x: any) {
            return !this.isObject(x) && !this.isArray(x);
        }
    }
}();

export function isSubObject(superObject: any, subObject: any): boolean {
    if (Array.isArray(superObject) && Array.isArray(subObject)) {
        return subObject.every((child, index) => isSubObject(superObject[index], child))
    }
    if (isObject(superObject) && isObject(subObject)) {
        return Object.entries(subObject).every(([key, value]) => isSubObject(
            (superObject as { [key: string]: any })[key],
            (subObject as { [key: string]: any })[key])
        )
    }
    return superObject === subObject;
}

export function OrderingCompareFn(actualRoots: causallyOrderable[], expectedRoots: causallyOrderable[]) {
    expect(actualRoots.length).toBeGreaterThan(0);
    let actual = expectedRoots
        .every(expectedRoot => {
                return actualRoots
                    .find(actualRoot => {
                        return isSubTree(
                            actualRoot,
                            expectedRoot,
                            isSubObject
                        );
                    });
            }
        );
    if (!actual) {
        console.log();
    }
    expect(actual).toBeTruthy();
}

export function isSubTree(tree: causallyOrderable, subTree: causallyOrderable, compareFn: CompareFn): boolean {
    if (!tree || !subTree) return false;
    let treeContainsSubTree = treeSubSet(tree, subTree, compareFn);
    let treeHasChildWhichIsEqual = tree.ancestors.find(ancestor => {
        return isSubTree(ancestor, subTree, compareFn);
    });
    return treeContainsSubTree ||
        !!treeHasChildWhichIsEqual
        ;
}

export function treeSubSet(tree: causallyOrderable, subTree: causallyOrderable, compareFn: CompareFn): boolean {
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

