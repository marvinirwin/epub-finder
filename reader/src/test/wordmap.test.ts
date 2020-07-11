import trie from "trie-prefix-tree";
import {AtomizedSentence} from "../lib/Atomize/AtomizedSentence";
import {uniq} from "lodash";
import {getAtomizedSentences} from "./Util/Util";

it("Constructs the word element map from a bookIndex", async () => {
    const atomizedSentences = getAtomizedSentences('BasicDoc.html');
    const t = trie(['Test']);
    const mappings = AtomizedSentence.getTextWordData(
        atomizedSentences,
        t,
        uniq(t.getWords(false).map(v => v.length))
    );
    expect(Object.values(mappings.wordElementsMap)).toHaveLength(1);
    expect(mappings.wordElementsMap['Test']).toHaveLength(12);
});