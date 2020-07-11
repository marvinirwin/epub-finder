import {getAtomizedSentences} from "./Util/Util";
import CardManager from "../lib/Manager/CardManager";
import {MyAppDatabase} from "../lib/Storage/AppDB";
import {getNewICardForWord, getUniqueLengths, sleep} from "../lib/Util/Util";
import {AtomizedSentence} from "../lib/Atomize/AtomizedSentence";
import {skip, take} from "rxjs/operators";
import {ITrie} from "../lib/Interfaces/Trie";
import {TextWordData} from "../lib/Atomize/TextWordData";

require("fake-indexeddb/auto");
const db = new MyAppDatabase();
/*
request.onupgradeneeded = function () {
    var db = request.result;
    var store = db.createObjectStore("cards", {keyPath: "id", autoIncrement: true});
    store.createIndex("by_learningLanguage", "learningLanguage", {});
    store.put();
}
*/

/*const indexDBSetup = new Promise<void>(resolve => {
    request.onsuccess = function (event) {
        resolve();
    };
});*/

function getWordElementMappings(atomizedSentences: AtomizedSentence[], trie: ITrie): TextWordData  {
    return AtomizedSentence.getTextWordData(
        atomizedSentences,
        trie,
        getUniqueLengths(trie)
    );
}

/*
test('Unpersisted cards added produce new elemnents on the wordmap', async () => {
    const cardManager = new CardManager(db);
    const atomizedSentences = getAtomizedSentences('BasicDoc.html');
    cardManager.addUnpersistedCards$.next([getNewICardForWord("Te", "")]);
    await sleep(0)
    const trie = await getNextTrie(cardManager);
    expect(getUniqueLengths(trie)).toHaveLength(1);
    const map = getWordElementMappings(atomizedSentences, trie)
    expect(map['Te']).toHaveLength(6);
});
*/


test('Persisted cards loaded produce new elemnents on the wordmap', async () => {
    await db.cards.add(getNewICardForWord("Te", ""));
    const cardManager = new CardManager(db);
    const atomizedSentences = getAtomizedSentences('BasicDoc.html');
    const triePromise: Promise<ITrie> = cardManager.trie$.pipe(take(1)).toPromise();
    await cardManager.load();
    const trie = await triePromise;
    expect(getUniqueLengths(trie)).toHaveLength(1);
    const data = getWordElementMappings(atomizedSentences, trie)
    expect(data.wordElementsMap['Te']).toHaveLength(6);
})
