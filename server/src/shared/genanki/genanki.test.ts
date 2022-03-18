import { Card } from "src/entities/card.entity";
import { Package } from "./package";
import { Deck } from "./deck";
import { Note } from "./note";
import { Model } from "./model";
const fetch = require("node-fetch");
const apiUrl = "http://localhost:8765";

/**
 * Currently the notes are the default model, in the future they'll use a more complex model for
 * sound and photograph based cards
 */
const getAnkiNotes = async (
  {
    cards,
    dictionaryDefinitionResolver,
    soundDownloader,
    photoDownloader
  }: {
    cards: Card[];
    dictionaryDefinitionResolver: (word: string) => Promise<string>;
    soundDownloader: (card: Card) => Promise<string>;
    photoDownloader: (card: Card) => Promise<string>;
  }) => {
  const notes = [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    notes.push(new Note(new Model({
      flds: [{name: 'test', ord: 0}],
      tmpls: [{}]
      }), [
        card.learning_language,
        await dictionaryDefinitionResolver(card.learning_language)
      ],
      ['test tag'],
      Math.ceil(Math.random()*100000000).toString()
    ));
  }
  return notes;
};
const importAnkiDeckToLocalAnkiConnect = (path: string) => {
  const body = JSON.stringify({ "action": "importPackage", "version": 6, "params": { "path": path } });
  fetch(apiUrl, { method: "POST", body });
};
const getDeckList = async (cards) => {
  const body = JSON.stringify({
    "action": "getDecks",
    "version": 6,
    "params": { "cards": cards }
  });
  const response = await fetch(apiUrl, { method: "POST", body });
  const result = await response.json();
  return result;
};
const getDeckNames = async () => {
  const body = JSON.stringify({ action: "deckNames", version: 6 });
  const response = await fetch(apiUrl, { method: "POST", body });
  const result = await response.json();
  return result;
}

describe("Generating anki decks", () => {
  /**
     * To make these tests pass, it's required that Anki and anki-connect are both installed
     * Anki is a flashcard reviewing program which you install on our computer https://apps.ankiweb.net/
     * AnkiConnect is an addon for that program, which makes the program list for http requests https://ankiweb.net/shared/info/2055492159
     * I'd like to create an anki package (With the ./package.ts class in this directory), write the anki package (filename.apkg) to a file, and then tell anki to import that file with anki-connect
     * The HTTP API for anki-connect can be found https://github.com/FooSoft/anki-connect
     * I think the way to import a package is POST http://127.0.0.1:8765 { "action": "importPackage", "version": 6, "params": { "path": "/data/Deck.apkg" } }
     * tip: use node-fetch to make HTTP requests, it's got the same interface as browser fetch
     */

  it("Is able to ping anki-connect", async () => {
    // creates a test deck to see if a successful connection is made
    const createDeckBody = JSON.stringify({ action: "createDeck", version: 6, params: { deck: "jest_test_deck" } });
    await fetch(apiUrl, { method: "POST", body: createDeckBody });
    const data = await getDeckNames();

    expect(data.result).toContain("jest_test_deck");

    // The "deleteDecks" action doesn't seem to work, it looks like there is an issue with the anki-connect implementation of "deleteDecks"
    /*
    // deletes the test deck
    const deleteDecksBody = JSON.stringify({
      action: "deleteDecks",
      version: 6,
      params: {
        decks: ["jest_test_deck"],
        cardsToo: true
      }
    });
    await fetch(apiUrl, { method: "POST", body: deleteDecksBody });
    const deckNames = await getDeckNames();

    expect(deckNames.result).not.toContain("jest_test_deck");
    */
  });

  it("Generates anki decks from cards", async () => {
    /**
     * TODO: This test isn't done yet
     */
    const records = [
      {
        id: "f7025165-737e-43fd-ad31-9630ddefc96b",
        learning_language: "如",
        language_code: "zh-Hans",
        photos: ["https://tse2.mm.bing.net/th?id=OIP.LOvu9Z8AqayKHyJ3WhmXegHaEK&pid=Api"],
        sounds: [],
        known_language: [],
        creator_id: 39,
        created_at: new Date("39,2021-05-23 21:03:10.116120 +00:00")
      },
      {
        id: "168f34dc-df7c-4518-9bad-121250a32611",
        learning_language: "当然",
        language_code: "zh-Hans",
        photos: ["https://tse1.mm.bing.net/th?id=OIP.SY_3GO_d9vIxB6DAs_k5HQHaEo&pid=Api"],
        sounds: [],
        known_language: [],
        creator_id: 39,
        created_at: new Date("2021-05-23 21:03:10.116120 +00:00")
      }
    ];

    const notes = await getAnkiNotes({
      cards: records,
      dictionaryDefinitionResolver: async (word) => `Dictionary definition for ${word}`,
      photoDownloader: async () => "",
      soundDownloader: async () => ""}
    );
    const deck = new Deck(null, "test deck", "a unit test deck");
    notes.forEach(note => deck.addNote(note));
    const ankiPackage = new Package();
    ankiPackage.addDeck(deck);
    ankiPackage.writeToFile("unit-test.apkg");

    // And POST this to the anki-connect instance and verify it exists
    importAnkiDeckToLocalAnkiConnect("/data/unit-test.apkg");
    const deckList = await getDeckList(["f7025165-737e-43fd-ad31-9630ddefc96b", "168f34dc-df7c-4518-9bad-121250a32611"]);
    const defaultCards = deckList.result.Default;
    expect(defaultCards).toContain("f7025165-737e-43fd-ad31-9630ddefc96b");
    expect(defaultCards).toContain("168f34dc-df7c-4518-9bad-121250a32611");
  });

  it("Inserts decks with a custom model", async () => {

  });
});