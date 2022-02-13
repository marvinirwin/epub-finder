import { Card } from "src/entities/card.entity";

const generateAnkiDeck = ({}: {
  cards: Card[]
  dictionaryDefinitionResolver: (word: string) => Promise<string>,
  soundDownloader: (card: Card) => Promise<string>
  photoDownloader: (card: Card) => Promise<string>
}) => {
}
describe("Generating anki decks", () => {
  it("Generates anki decks from cards", () => {
    const records = [
      {
        id: "f7025165-737e-43fd-ad31-9630ddefc96b",
        learning_language: "如",
        language_code: "zh-Hans",
        photos: ["https://tse2.mm.bing.net/th?id=OIP.LOvu9Z8AqayKHyJ3WhmXegHaEK&pid=Api"],
        sounds: [],
        known_language: [],
        "39,2021-05-23 21:03:10.116120 +00:00" ,
      },
    {
      id: "168f34dc-df7c-4518-9bad-121250a32611",
      learning_language: "当然",
      language_code:"zh-Hans",
      photos: ["https://tse1.mm.bing.net/th?id=OIP.SY_3GO_d9vIxB6DAs_k5HQHaEo&pid=Api"],
      sounds: [],
      known_language: [],
      39,"2021-05-23 21:03:10.116120 +00:00"
    }
    ]
  });
});