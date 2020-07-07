import {getAtomizedSentences} from "./Util/Util";
import CardManager from "../lib/Manager/CardManager";
import {MyAppDatabase} from "../lib/Storage/AppDB";
import {getNewICardForWord, sleep} from "../lib/Util/Util";
import {AtomizedSentence} from "../lib/Atomize/AtomizedSentence";
import {skip, take} from "rxjs/operators";

require("fake-indexeddb/auto");

const request = indexedDB.open("MyAppDatabase", MyAppDatabase.CURRENT_VERSION);
request.onupgradeneeded = function () {
    var db = request.result;
    var store = db.createObjectStore("cards", {keyPath: "id++"});
    store.createIndex("by_learningLanguage", "learningLanguage", {});
    store.put(getNewICardForWord("Te", ""));
}

const indexDBSetup = new Promise<void>(resolve => {
    request.onsuccess = function (event) {
        resolve();
    };
});

test('Unpersisted cards added produce new elemnents on the wordmap', async () => {
    await indexDBSetup;
    const db = new MyAppDatabase();
    const cardManager = new CardManager(db);
    const atomizedSentences = getAtomizedSentences('BasicDoc.html');
    cardManager.addUnpersistedCards$.next([getNewICardForWord("Te", "")]);
    await sleep(1000);
    expect(cardManager.trie.t.getWords()).toHaveLength(1);
    const map = AtomizedSentence.getWordElementMappings(
        atomizedSentences,
        cardManager.trie.t,
        cardManager.trie.getUniqueLengths()
    )
    expect(map['Te'].length === 6);
});


test('Persisted cards loaded produce new elemnents on the wordmap', async () => {
    await indexDBSetup;
    const db = new MyAppDatabase();
    const cardManager = new CardManager(db);
    cardManager.load();
    const atomizedSentences = getAtomizedSentences('BasicDoc');
    const map = AtomizedSentence.getWordElementMappings(
        atomizedSentences,
        cardManager.trie.t,
        cardManager.trie.getUniqueLengths()
    )
    expect(map['Te'].length === 6);
})
