import {Run} from "../Util/Run";
import {AsciiGraph} from "../Util/ASCIIGraph";
it('Observes coldly', () => {
    Run(({manager, scheduler, helpers: {hot}}) => {
        const a = hot('a');
        const b = hot('-b');
        const c = hot('--c');
        scheduler
            .expectOrderings(a, b, c)
            .toHaveOrdering(AsciiGraph.getOrderables('a>b>c', {}))
    });
})