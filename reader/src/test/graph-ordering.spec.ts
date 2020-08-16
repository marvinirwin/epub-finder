import {AsciiGraph} from "./Util/GetGraphJson";

const defaultGraph = `
    delta<-------
    ^           |
 echo<-alpha<---charlie
  ^             ^
  |             |
  -bravo.next(bravoValue)
`
const g = new AsciiGraph(defaultGraph);

it('Gets neighbors correctly', () => {
    expect(g.edges).toEqual({
        alpha: ['echo'],
        charlie: ['alpha', 'delta'],
        'bravo.next(bravoValue)': ['charlie', 'echo'],
        echo: ['delta']
    });
});


