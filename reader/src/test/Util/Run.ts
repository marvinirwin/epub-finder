import {Manager} from "../../lib/Manager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {UnitTestAudio} from "../../lib/Audio/UnitTestAudio";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";
import {UnitTestGetBookRenderer} from "../../lib/AppContext/UnitTestGetBookRenderer";
import {of} from "rxjs";
import * as fs from "fs";
import {join} from "path";
import {Website} from "../../lib/Website/Website";
import {MyTestScheduler} from "./MyTestScheduler";
import {OrderingCompareFn} from "../Graph/CompareFunctions";
import {tap} from "rxjs/operators";

require("fake-indexeddb/auto");

export type RunArguments = { manager: Manager, scheduler: MyTestScheduler, helpers: RunHelpers }

export const UnitTestGetPageSrc = (url: string) => of(
    fs.readFileSync(join(__dirname, '../fixtures/', url)).toString()
);


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
                getPageRenderer: UnitTestGetBookRenderer,
                getPageSrc: UnitTestGetPageSrc
            }
        );

        cb({
            manager: manager,
            scheduler,
            helpers
        })
    })
}