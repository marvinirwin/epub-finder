import {MyTestScheduler} from "../Util/MyTestScheduler";
import {isSubObject, isSubTree} from "../Graph/CompareFunctions";

it('Compares subtrees correctly', () => {
    const tree = {
        value: 1,
        ancestors: [
            {
                value: 2,
                ancestors: [
                    {
                        value: 4,
                        ancestors: []
                    }
                ]
            },
            {
                value: 3,
                ancestors: [
                    {
                        value: 5,
                        ancestors: []
                    }
                ]
            }
        ]
    };

    const correctSubTree = {
        value: 2,
        ancestors: [
            {
                value: 5,
                ancestors: []
            }
        ]
    };

    const incorrectSubTree = {
        value: 1,
        ancestors: [
            {
                value: 5,
                ancestors: []
            }
        ]
    }
    expect(isSubTree(tree, correctSubTree, isSubObject));
    expect(isSubTree(tree, incorrectSubTree, isSubObject)).toBeFalsy();
});
