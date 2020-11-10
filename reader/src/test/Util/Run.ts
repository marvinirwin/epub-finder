import {Manager} from "../../lib/Manager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {UnitTestAudio} from "../../lib/Audio/UnitTestAudio";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";
import {of} from "rxjs";
import * as fs from "fs";
import {join} from "path";
import {MyTestScheduler} from "./MyTestScheduler";
import {OrderingCompareFn} from "../Graph/CompareFunctions";

require("fake-indexeddb/auto");

export type RunArguments = { manager: Manager, scheduler: MyTestScheduler, helpers: RunHelpers }

export function UnitTestGetPageSrcText(url: string) {
    return fs.readFileSync(join(__dirname, '../fixtures/', url)).toString();
}

/*
function extracted(manager: Manager) {
    manager.pageManager.addPage$.next(new Website(
        "Basic Doc",
        "BasicDoc.html",
        UnitTestGetPageSrc
    ));
}
*/

export function Run(cb: (r: RunArguments) => void) {
    const scheduler = new MyTestScheduler(OrderingCompareFn);
    scheduler.run(helpers => {
        // Will I need to require the fake indexDB every time?
        const manager = new Manager(
            new MyAppDatabase(),
            {
                audioSource: new UnitTestAudio("YEET"),
            }
        );

        cb({
            manager,
            scheduler,
            helpers
        })
    })
}