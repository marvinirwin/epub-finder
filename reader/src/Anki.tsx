import React, {ReactElement, useEffect, useState} from 'react';
import * as _ from 'lodash';
import {Dictionary, invert, groupBy, flatten, flattenDeep} from 'lodash';
import './App.css';
// @ts-ignore
import {getBinaryContent} from 'jszip-utils';
import JSZip from 'jszip';
import initSqlJs from "sql.js";
import {SqlJs} from "sql.js/module";
import ReactTooltip from "react-tooltip";


export interface col {
    decks: string;
    id: string;
}

export interface card {
    nid: number;
    did: string;
}

export interface note {
    flds: string
}

export interface deck {
    id: string;
}

export class Collection {
    constructor(public decks: Deck[]) {
    }
}

export class Deck {
    constructor(public cards: Card[]) {
    }
}

export class Card {
    interpolatdFields: string[] = [];
    constructor(public fields: string[]) {
        // So basically the act of displaying a card involves parsing its fields and then inlining the images
    }

    get front(): string {
        return this.interpolatdFields[0].normalize();
    }

    get back(): string {
        return this.interpolatdFields[1].normalize();
    }
    async interpolateImageSources(getField: (s: string) => Promise<string>): Promise<string[]> {
        let callbackfn = async (f: string) => {
            let domparser = new DOMParser();
            const d = domparser.parseFromString(f, 'text/html');
            const mediaTags = d.getElementsByTagName('img');
            for (let i = 0; i < mediaTags.length; i++) {
                const mediaTag = mediaTags[i];
                let attribute = mediaTag.getAttribute('src');
                if (!attribute) {
                    throw new Error('image no source');
                }
                mediaTag.setAttribute('src', await getField(attribute || ''));
            }
            return d.documentElement.innerHTML;
        };
        return Promise.all(this.fields.map(callbackfn))
    }
}

export interface Model {
    deckId: string;
    name: string;
    cards: Card[];
}

export interface Card {
    note: Note;
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
                return c
                    .front
                    .split('')
                    .filter(s => s.match(/[\u4E00-\uFA29]/))
                    .join('')
            }
        );
    }

    public static async init(sql: SqlJs.Database, zip: JSZip, media: {[key: string]: string}): Promise<AnkiPackage> {
        try {
            const collections = await AnkiPackage.initCollections(sql, zip, media);
            const p = new AnkiPackage(collections, zip);
            collections.map(c => c.decks.map(d => d.cards.map(c => c.fields)))
            return p;
        } catch(e) {
            debugger;
            throw e;
        }
    }

    static async initCollections(sql: SqlJs.Database, zip: JSZip, media: {[key: string]: string}) {
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
            let deck = decks[col.id];
            let decks2 = Object.values(deck);
            let decks1 = await Promise.all(decks2.map(async d => {
                let cards1 = await Promise.all((cards[d.id] || []).map(async card => {
                    let noteElement: note = notes[card.nid][0];
                    const cardInstance = new Card(noteElement.flds.split("\0x1f"));
                    cardInstance.interpolatdFields = await cardInstance.interpolateImageSources(async (href) => {
                        const imageSrc = await zip.files[media[href]].async('base64');
                        return `data:image/jpeg;base64,${imageSrc}`;
                    })
                    return cardInstance;
                }));
                return new Deck(cards1);
            }));
            return new Collection(decks1)
        }))
        return collections;
    }
}

export function loadAnkiPackageFromFile(filename: string): Promise<AnkiPackage> {
    return new Promise((resolve, reject) => {
        getBinaryContent(filename, async function (err: boolean | Error, data: any) {
            if (err) {
                reject(err);
            }
            const v = await JSZip.loadAsync(data);
            const ankiDatabaseBinary = await v.files['collection.anki2'].async('uint8array');
            const mediafile: {[key: string]: string} = invert(JSON.parse(await v.files['media'].async('text')));
            const SQL = await initSqlJs();
            var db = new SQL.Database(ankiDatabaseBinary);
            resolve(await AnkiPackage.init(db, v, mediafile));
        });
    })
}


export function FlashcardPopup({text, card}: {text: string, card: Card}) {
    return <span data-tooltip={card.front}>
        {text}
    </span>
}



