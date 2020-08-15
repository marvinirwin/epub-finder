import {AsciiGraph} from "./Util/GetGraphJson";

const defaultGraph = `
    d<----
    ^    |
 e<-a<---c
    ^  
    |  
    b   
`
const g = new AsciiGraph(defaultGraph)

it('Gets neighbors correctly', () => {
    expect(g.edges).toEqual({
        a: ['e', 'd'],
        b: ['a'],
        c: ['a', 'd'],
    })
});

it('Converts the graphs to happens before relationships', () => {
    g.
});
