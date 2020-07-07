import {AtomizedDocument} from "../../lib/Atomize/AtomizedDocument";
import {readFileSync} from "fs-extra";
import {join} from "path";

export function getAtomizedSentences(paths: string) {
    return AtomizedDocument.atomizeDocument(readFileSync(join(__dirname, '../fixtures', paths)).toString())
        .getAtomizedSentences();
}