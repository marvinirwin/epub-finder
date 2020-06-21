import * as _ from 'lodash';
import {Dictionary, flattenDeep, groupBy, uniq} from 'lodash';
// @ts-ignore
import JSZip from 'jszip';
import {SqlJs} from "sql.js/module";
import {Card, isChineseCharacter} from "./lib/Interfaces/OldAnkiClasses/Card";
import {Collection} from "./lib/Interfaces/OldAnkiClasses/Collection";
import {deck} from "./lib/Interfaces/AnkiPackageSQLiteTables/deck";
import {note} from "./lib/Interfaces/AnkiPackageSQLiteTables/note";
import {card} from "./lib/Interfaces/AnkiPackageSQLiteTables/card";
import {col} from "./lib/Interfaces/AnkiPackageSQLiteTables/col";
import {Deck} from "./lib/Interfaces/OldAnkiClasses/Deck";
import {Subject} from "rxjs";
import {GetICard, ICard} from "./lib/Interfaces/ICard";

export interface Model {
    deckId: string;
    name: string;
    cards: Card[];
}

export interface Note {
    guid: string;
    flds: string[];
}

export function prep<T>(sql: SqlJs.Database, statement: string, params: any[]): T[] {
    const res = []
    if (params.length) {
        const stmt = sql.prepare(
            statement
        );
        stmt.bind(params);
        while (stmt.step()) {
            // @ts-ignore
            res.push(stmt.getAsObject())
        }
    } else {
        const rows = sql.exec(statement);

        rows.forEach(r => {
            r.values.forEach(v => {
                res.push(_.zipObject(r.columns, v))
            })
        })
    }
    // @ts-ignore
    return res;
}

export class AnkiPackage {
    allCards: ICard[];
    cardIndex: Dictionary<ICard[]>;
    messages$: Subject<string> = new Subject<string>();

    public constructor(public collections: Collection[], public zip: JSZip) {
        this.allCards = flattenDeep(this.collections.map(c => c.decks.map(d => d.cards)))
        this.cardIndex = groupBy(this.allCards, c => {
                const v = uniq(
                    c.fields[0]
                        .split('')
                        .filter(isChineseCharacter)
                        .join(''))
                if (v.length) {
                    return v[0];
                }
                return v;
            }
        );
    }

    static async* initCollections(
        sql: SqlJs.Database, zip: JSZip, media: { [key: string]: string }, mesg: (s: string) => void,
        packageName: string
    ): AsyncGenerator<ICard> {
        const cols: col[] = prep<col>(sql,
            `SELECT decks, id
            FROM col
            ORDER BY rowid DESC
            `,
            []
        );

        const decks: Dictionary<Dictionary<deck>> = cols.reduce((acc: Dictionary<Dictionary<deck>>, c) => {
            acc[String(c.id)] = JSON.parse(c.decks);
            return acc;
        }, {});

        const deckIds: string[] = _.flattenDeep(Object.values(decks).map(d => Object.values(d))).map(d => d.id);


        let allCardsInDB = prep<card>(sql, `
                SELECT * FROM
                cards
                /*WHERE did IN (${deckIds.map(d => '?').join(',')})*/
                ORDER BY rowid DESC`,
            [/*deckIds*/]);

        const cards: Dictionary<card[]> = _.groupBy(allCardsInDB, 'did');


        let noteIds = _.flatten(Object.values(cards)).map(c => c.nid);
        const notes: Dictionary<note[]> = _.groupBy<note>(prep(sql, `
                SELECT * FROM
                notes 
                /*WHERE id IN (${noteIds.map(n => '?').join(', ')})*/
                ORDER BY rowid DESC`,
            [/*noteIds*/]
        ), 'id');


        // Now let's assign some things
        const collections = [];
        let cardsprocessed = 0;
        let cardsTotal = allCardsInDB.length;
        const interval = setInterval(() => {
            mesg(`Cards Processed ${cardsprocessed} / ${cardsTotal}`)
        }, 500);
        for (let i = 0; i < cols.length; i++) {
            const col = cols[i];
            let decksForThisCollectionDict = decks[col.id];
            let decksForThisCollection = Object.values(decksForThisCollectionDict);
            const newDecks: Deck[] = [];
            for (let j = 0; j < decksForThisCollection.length; j++) {
                const currentDeck = decksForThisCollection[j];
                let cardsForThisDeck = cards[currentDeck.id] || [];
                const newCards = []
                for (let k = 0; k < cardsForThisDeck.length; k++) {
                    const card = cardsForThisDeck[k];
                    let noteElement: note = notes[card.nid][0];
                    let fields = noteElement.flds.split("\x1f");
                    let iCard: ICard = await GetICard(
                        fields,
                        async (href) => {
                            const ext = href.split('').reverse().join('').split('.')[0].split('').reverse().join('');
                            let file = zip.files[media[href]];
                            if (!file) {
                                return '';
                            }
                            const imageSrc = await file.async('base64');
                            switch (ext) {
                                case 'wav':
                                    return `data:audio/wav;base64,${imageSrc}`
                                case 'mp3':
                                    return `data:audio/mp3;base64,${imageSrc}`
                                case 'jpeg':
                                    return `data:image/jpeg;base64,${imageSrc}`;
                                case 'gif':
                                    return `data:image/gif;base64,${imageSrc}`;
                                default:
                                    debugger;
                                    console.log();
                                    return '';
                            }
                        }, currentDeck.name, packageName, 'TODO_COLLECTION_NAME');
                    if (!fields || !iCard) {
                        debugger;
                        console.log();
                    }
                    // const cardInstance = new Card(fields, iCard.fields, currentDeck.name, 'TODO_COLLECTION_NAME', packageName, iCard);
                    yield iCard;
                }

            }
        }
        clearInterval(interval);
    }
}



