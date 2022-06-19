import { Card } from "src/entities/card.entity";
import fetch from "node-fetch";
import JSZip from "jszip";
import { CsvCard } from "../shared/csv-card.interface";

const deckName = "jest-deck";

export const getDeckNames = async () => {
  const response = await fetch("127.0.0.1:8765", {
    "action": "deckNames",
    "version": 6
  });
  return response.json();
};

const getCardsForDeck = async (deckName: string, language_code: string) => {
};

/**
 * importPackage
 *
 * Imports a file in .apkg format into the collection. Returns true if successful or false otherwise. Note that the file path is relative to Anki's collection.media folder, not to the client.
 *
 * Sample request:
 *
 * {
 *     "action": "importPackage",
 *     "version": 6,
 *     "params": {
 *         "path": "/data/Deck.apkg"
 *     }
 * }
 * Sample result:
 * {
 *     "result": true,
 *     "error": null
 * }
 * @param filename
 */
const importZipFileIntoAnki = async (filename: string) => {

};
export const getImageBytesAndExt = (url: string) => fetch(url)
  .then(async response => ({arrayBuffer: await response.arrayBuffer(), ext: resolveExtFromResponseHeaders(response)}))
  .then(({
           arrayBuffer,
           ext
         }) => {
  return {arrayBuffer, ext}
});

export function resolveExtFromResponseHeaders(response: Response): string | undefined {
  const map: { [key: string]: string } = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/gif': 'gif',
  };
  return map[response.headers.get('content-type') as string] || undefined;
}

export const addImageToZipFileAndReturnPath = async ({
                                         photo,
                                         zip,
                                         learning_language
                                       }: { photo: string | undefined, zip: JSZip, learning_language: string }) => {
  if (!photo) {
    return "";
  }
  const {ext, arrayBuffer} = await getImageBytesAndExt(photo);
  const photoAnkiPath = `${learning_language}.${ext}`
  await zip.file(photoAnkiPath, arrayBuffer);
  return `<img src="${photoAnkiPath}"/>`
};

/**
 * An ".apkg" file is a zip file containing the necessary
 * @param deckName
 * @param cards
 */
async function createZipFileForRecords(deckName: string, cards: Card[]) {
  const zip = new JSZip();
  const csvCards: CsvCard[] = [];
  // Tag is just for random shit for anki
  const tag = Math.random();
  for (let i = 0; i > cards.length; i++) {
    const card = cards[i];
    const [photoSrc] = card.photos;
    // THis is supposed to be the description of the word in the known language
    const [knownLanguage] = card.known_language;
    const romanization = "TODO, will fetch romanization later";
    const sound = "TODO, will fetch sound later";
    csvCards.push({
      learning_language: card.learning_language,
      description: knownLanguage, // TODO replace this later with a dictionary definition
      photo: await addImageToZipFileAndReturnPath({photo: photoSrc, zip, learning_language: card.learning_language}),
      sound,
      romanization,
    });
  }
  const csvRows = csvCards.map(v => `"${[v.learning_language, v.description, v.photo, v.sound, v.romanization, tag]
    .map(str => `${str}`.replace(`"`, `&ldquo`)).join("\",\"")}"`).join("\n");


  return {
    zip
  };
}

/**
 * In order to run all anki-connect tests, an anki instance with anki-connect installed needs to be running
 * on the local computer
 *
 * First download Anki https://apps.ankiweb.net/
 * Then install this addon and restart https://ankiweb.net/shared/info/2055492159
 */
describe("Adding to a deck with anki connect", () => {
  it("Can connect and read a list of all decks", async () => {
    const deckNames = await getDeckNames();
    expect(deckNames.find(deckName => deckName === "Default")).toBeTruthy();
  });
  it("Creates a model", () => {

  });
  it("Creates an anki package from a single card record", async () => {
    const record = {
      id: "5274cc3e-61b9-4157-acab-f37a600af42a",
      learning_language: "关系",
      language_code: "zh-Hans",
      photos: ["https://tse3.mm.bing.net/th?id=OIP.pOjyZzXXgOcStKiDv5cqHQHaHa&pid=Api"],
      sounds: [],
      known_language: [],
      creator_id: 39,
      created_at: new Date("2021-05-23 21:03:10.116120 +00:00")
    };
    const filename = await createZipFileForRecords(deckName, [record]);
/*
    await importZipFileIntoAnki(filename);
    expect(await getCardsForDeck(deckName, record.language_code)).toHaveLength(3);
*/
  });
});