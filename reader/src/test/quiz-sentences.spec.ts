import {getGraphJson} from "./Util/GetGraphJson";
require("fake-indexeddb/auto");

it('It can resolve all the sentences for the current quiz item', (done) => {
    getGraphJson(`
                  a---b
        `).then(result => {
            console.log(result);
            done();
    });
})
