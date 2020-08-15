import {AsciiGraph} from "./Util/GetGraphJson";

it('Gets neighbors correctly', () => {
    const str = `
    d<----
    ^    |
 e<-a<---c
    ^  
    |  
    b   
`
    const g = new AsciiGraph(str);
    expect(g.edges).toEqual({
        a: ['e', 'd'],
        b: ['a'],
        c: ['a', 'd'],
    })
})