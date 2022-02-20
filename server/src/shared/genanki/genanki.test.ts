import { Card } from "src/entities/card.entity";
import { Package } from "./package";
import { Deck } from "./deck";

const generateAnkiDeck = ({}: {
  cards: Card[];
  dictionaryDefinitionResolver: (word: string) => Promise<string>;
  soundDownloader: (card: Card) => Promise<string>;
  photoDownloader: (card: Card) => Promise<string>;
}) => {
};
describe("Generating anki decks", () => {
  it("Is able to ping anki-connect", async () => {
    /**
     * To make these tests pass, it's required that Anki and anki-connect are both installed
     * Anki is a flashcard reviewing program which you install on our computer https://apps.ankiweb.net/
     * AnkiConnect is an addon for that program, which makes the program list for http requests https://ankiweb.net/shared/info/2055492159
     * I'd like to create an anki package (With the ./package.ts class in this directory), write the anki package (filename.apkg) to a file, and then tell anki to import that file with anki-connect
     * The HTTP API for anki-connect can be found https://github.com/FooSoft/anki-connect
     * I think the way to import a package is POST http://127.0.0.1:8765 { "action": "importPackage", "version": 6, "params": { "path": "/data/Deck.apkg" } }
     * tip: use node-fetch to make HTTP requests, it's got the same interface as browser fetch
     */
    const ankiPackage = new Package();
    const deck = new Deck("id", "test");
    ankiPackage.addDeck(deck);
    ankiPackage.writeToFile("test.apkg");
    const importAnkiDeckToLocalAnkiConnect = () => {
      // POST http://127.0.0.1:8765 { "action": "importPackage", "version": 6, "params": { "path": "/data/Deck.apkg" } }
    };
    const getDeckList = () => {
      // return the results of POST http://127.0.0.1:8765 { "action": "getDecks", "version": 6, "params": { "cards": [1502298036657, 1502298033753, 1502032366472] } }
    };
    importAnkiDeckToLocalAnkiConnect();
    expect(await getDeckList()).toContain("test");
  });
  it("Generates anki decks from cards", () => {
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
        created_at: "39,2021-05-23 21:03:10.116120 +00:00" ,
      },
    {
      id: "168f34dc-df7c-4518-9bad-121250a32611",
      learning_language: "当然",
      language_code:"zh-Hans",
      photos: ["https://tse1.mm.bing.net/th?id=OIP.SY_3GO_d9vIxB6DAs_k5HQHaEo&pid=Api"],
      sounds: [],
      known_language: [],
      creator_id: 39,
      created_at: "2021-05-23 21:03:10.116120 +00:00"
    }
    ];
  });



});