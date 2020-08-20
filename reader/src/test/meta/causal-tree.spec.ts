import {CausalTree} from "../Graph/CausalTree";
import {AsciiGraph} from "../Util/ASCIIGraph";

const graph1 = `
    delta<-------
    ^           |
 echo<-alpha<---charlie
  ^             ^
  |             |
  -bravo$.next(bravoValue)
`

const valueMap1 = {
    delta: 'DELTA',
    bravo$: {
        next(v: any) {
        }
    }
};
const expected1 = {
    'bravo$.next(bravoValue)': ['charlie', 'echo'],
    'echo': ['delta'],
    'charlie': ['alpha', 'delta'],
    'alpha': ['echo']
}
const graph2 = `

       hotel<-
       ^     |
       |     |
   ->golf    |
   |         |
   |         |
  foxtrot$.next(foxtrot)
`;

const valueMap2 = {
    foxtrot$: {
        next(v: any) {
        }
    }
};

const expected2 = {
    'foxtrot$.next(foxtrot)': ['hotel', 'golf'],
    'golf': ['hotel']
}


it('Creates correct adjacency lists when initialzed alone, and compressing', () => {
    let c1 = new CausalTree(
        new AsciiGraph(graph1).edges,
        valueMap1
    );
    expect(
        c1.getAdjListThatMovesForwardsInTime()
    ).toEqual(expected1);

    let c2 = new CausalTree(
        new AsciiGraph(graph2).edges,
        valueMap2
    );
    expect(
        c2.getAdjListThatMovesForwardsInTime()
    ).toEqual(expected2);

    c1.ancestors.push(c2);

    const c3 = c1.getCompressedTree()

    expect(c3.getAdjListThatMovesForwardsInTime())
        .toEqual({
            hotel: ['bravo$.next(bravoValue)'],
            ...expected1,
            ...expected2
        })

    expect(c3.valueMap).toEqual(
        {
            ...valueMap1,
            ...valueMap2
        }
    )
});

