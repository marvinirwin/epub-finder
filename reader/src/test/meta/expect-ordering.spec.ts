import {MyTestScheduler} from "../Util/MyTestScheduler";
import {Run} from "../Util/Run";
import {AsciiGraph} from "../Util/ASCIIGraph";
import {isSubObject} from "../Graph/CompareFunctions";

const defaultGraph = `
    delta<-------
    ^           |
 echo<-alpha<---charlie
  ^             ^
  |             |
  -bravo.next(bravoValue)
`

it('Gets neighbors correctly', () => {
    expect(new AsciiGraph(defaultGraph).edges).toEqual({
        alpha: ['echo'],
        charlie: ['alpha', 'delta'],
        'bravo.next(bravoValue)': ['charlie', 'echo'],
        echo: ['delta']
    });
});

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
    expect(MyTestScheduler.isSubTree(tree, correctSubTree, isSubObject));
    expect(MyTestScheduler.isSubTree(tree, incorrectSubTree, isSubObject)).toBeFalsy();
});



