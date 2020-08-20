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




