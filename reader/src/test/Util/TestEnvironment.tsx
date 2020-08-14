import {Manager} from "../../lib/Manager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {UnitTestAudio} from "../../lib/Audio/UnitTestAudio";
import {getTestScheduler, MyTestScheduler} from "./Util";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";

require("fake-indexeddb/auto");

export type RunArguments = { manager: Manager, scheduler: MyTestScheduler, helpers: RunHelpers }

export function run(cb: (r: RunArguments) => void) {
    const scheduler = getTestScheduler();
    scheduler.run(helpers => {
        // Will I need to require the fake indexDB every time?
        cb({
            manager: new Manager(
                new MyAppDatabase(),
                new UnitTestAudio("YEET"))
            ,
            scheduler,
            helpers
        })
    })
}