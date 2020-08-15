import {Manager} from "../../lib/Manager";
import {MyAppDatabase} from "../../lib/Storage/AppDB";
import {UnitTestAudio} from "../../lib/Audio/UnitTestAudio";
import {getTestScheduler, MyTestScheduler} from "./Util";
import {RunHelpers} from "rxjs/internal/testing/TestScheduler";
import {UnitTestAtomize} from "../../lib/AppContext/UnitTestAtomize";
import {of} from "rxjs";
import * as fs from "fs";
import { join } from "path";

require("fake-indexeddb/auto");

export type RunArguments = { manager: Manager, scheduler: MyTestScheduler, helpers: RunHelpers }

export function Run(cb: (r: RunArguments) => void) {
    const scheduler = getTestScheduler();
    scheduler.run(helpers => {
        // Will I need to require the fake indexDB every time?
        const manager = new Manager(
            new MyAppDatabase(),
            {
                audioSource: new UnitTestAudio("YEET"),
                getPageRenderer: UnitTestAtomize,
                getPageSrc: url => of(fs.readFileSync(join(__dirname, '../fixtures/', url)).toString())
            });


        cb({
            manager: manager,
            scheduler,
            helpers
        })
    })
}