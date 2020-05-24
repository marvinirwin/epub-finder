import * as _ from 'lodash';
import {Dictionary, flattenDeep, groupBy, uniq} from 'lodash';
// @ts-ignore
import JSZip from 'jszip';
import {SqlJs} from "sql.js/module";
import {Card} from "./lib/worker-safe/Card";
import {Collection} from "./lib/worker-safe/Collection";
import {deck} from "./lib/worker-safe/tables/deck";
import {note} from "./lib/worker-safe/tables/note";
import {card} from "./lib/worker-safe/tables/card";
import {col} from "./lib/worker-safe/tables/col";
import {Deck} from "./lib/worker-safe/Deck";

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
    allCards: Card[];
    cardMap: Dictionary<Card[]>;

    public constructor(public collections: Collection[], public zip: JSZip) {
        this.allCards = flattenDeep(this.collections.map(c => c.decks.map(d => d.cards)))
        this.cardMap = groupBy(this.allCards, c => {
                const v = uniq(c
                    .front
                    .split('')
                    .filter(s => s.match(/[\u4E00-\uFA29]/)))
                    .join('')
                if (v.length) {
                    return v[0];
                }
                return v;
            }
        );
    }

    public static async init(sql: SqlJs.Database, zip: JSZip, media: { [key: string]: string }): Promise<AnkiPackage> {
        try {
            const collections = await AnkiPackage.initCollections(sql, zip, media);
            const p = new AnkiPackage(collections, zip);
            collections.map(c => c.decks.map(d => d.cards.map(c => c.fields)))
            return p;
        } catch (e) {
            debugger;
            throw e;
        }
    }

    static async initCollections(sql: SqlJs.Database, zip: JSZip, media: { [key: string]: string }) {
        const tables = prep(sql, `SELECT name FROM sqlite_master WHERE type='table';
`, []);
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


        const cards: Dictionary<card[]> = _.groupBy(prep<card>(sql, `
                SELECT * FROM
                cards
                /*WHERE did IN (${deckIds.map(d => '?').join(',')})*/
                ORDER BY rowid DESC`,
            [/*deckIds*/]), 'did');


        let noteIds = _.flatten(Object.values(cards)).map(c => c.nid);
        const notes: Dictionary<note[]> = _.groupBy<note>(prep(sql, `
                SELECT * FROM
                notes 
                /*WHERE id IN (${noteIds.map(n => '?').join(', ')})*/
                ORDER BY rowid DESC`,
            [/*noteIds*/]
        ), 'id');


        // Now let's assign some things
        let values = Object.values(cols);
        const collections = await Promise.all(values.map(async col => {
            let decksForThisCollectionDict = decks[col.id];
            let decksForThisCollection = Object.values(decksForThisCollectionDict);
            let processedDecks = await Promise.all(decksForThisCollection.map(async d => {
                let cards1 = await Promise.all((cards[d.id] || []).map(async card => {
                    let noteElement: note = notes[card.nid][0];
                    let fields = noteElement.flds.split("\0x1f");
                    let interpolatedFields = await Card.interpolateMediaTags(fields, async (href) => {
                        let file = zip.files[media[href]];
                        if (!file) {
                            return '';
                        }
                        const imageSrc = await file.async('base64');
                        return `data:image/jpeg;base64,${imageSrc}`;
                    });
                    if (!fields || !interpolatedFields) {
                        debugger;console.log();
                    }
                    const cardInstance = new Card(fields, interpolatedFields);
                    return cardInstance;
                }));
                return new Deck(cards1, d.name);
            }));
            return new Collection(processedDecks, 'TODO figure out how to name collections')
        }))
        return collections;
    }
}



