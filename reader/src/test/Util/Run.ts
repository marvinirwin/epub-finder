import {Manager} from "../../lib/Manager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {UnitTestAudio} from "../../lib/Audio/UnitTestAudio";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";
import {UnitTestAtomize} from "../../lib/AppContext/UnitTestAtomize";
import {of} from "rxjs";
import * as fs from "fs";
import {join} from "path";
import {Website} from "../../lib/Website/Website";
import {MyTestScheduler} from "./MyTestScheduler";

require("fake-indexeddb/auto");

export type RunArguments = { manager: Manager, scheduler: MyTestScheduler, helpers: RunHelpers }

const UnitTestGetPageSrc = (url: string) => of(fs.readFileSync(join(__dirname, '../fixtures/', url)).toString());


function extracted(manager: Manager) {
    manager.pageManager.addPage$.next(new Website(
        "Basic Doc",
        "BasicDoc.html",
        UnitTestGetPageSrc
    ));
}

export function Run(cb: (r: RunArguments) => void) {
    const scheduler = new MyTestScheduler(MyTestScheduler.orderingCompareFn);
    scheduler.run(helpers => {
        // Will I need to require the fake indexDB every time?
        const manager = new Manager(
            new MyAppDatabase(),
            {
                audioSource: new UnitTestAudio("YEET"),
                getPageRenderer: UnitTestAtomize,
                getPageSrc: UnitTestGetPageSrc
            });

        cb({
            manager: manager,
            scheduler,
            helpers
        })
    })
}