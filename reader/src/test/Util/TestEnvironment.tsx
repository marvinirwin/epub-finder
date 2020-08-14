import {Manager} from "../../lib/Manager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {UnitTestAudio} from "../../lib/Audio/UnitTestAudio";
import {getTestScheduler, MyTestScheduler} from "./Util";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();

export type RunArguments = { manager: Manager, scheduler: MyTestScheduler, helpers: RunHelpers }

export function run(cb: (r: RunArguments) => void) {
    const scheduler = getTestScheduler();
    scheduler.run(helpers => {
        cb({
            manager: new Manager(db, new UnitTestAudio("YEET")),
            scheduler,
            helpers
        })
    })
}