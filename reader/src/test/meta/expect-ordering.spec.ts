import {MyTestScheduler} from "../Util/MyTestScheduler";
import {Run} from "../Util/Run";
import {AsciiGraph} from "../Util/ASCIIGraph";

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
    expect(MyTestScheduler.isSubTree(tree, correctSubTree));
    expect(MyTestScheduler.isSubTree(tree, incorrectSubTree)).toBeFalsy();
});

try {
    it('Expects orderings correctly', async () => {
        Run(({manager, scheduler, helpers: {hot}}) => {
            const a = hot('a');
            const b = hot('-b');
            const c = hot('--c');
            scheduler
                .expectOrderings(a, b, c)
                .toHaveOrdering(AsciiGraph.getOrderables('a>c>b', {}))
        });
    })
} catch(e) {
    console.error(e);
}


