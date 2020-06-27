import {DOMParser, XMLSerializer} from "xmldom";

export interface ICard {
    id?: number; // Primary key. Optional (autoincremented)
    learningLanguage: string;
    photos: string[];
    sounds: string[];
    knownLanguage: string[];
    ankiPackage: string | undefined;
    collection: string | undefined;
    deck: string | undefined;
    fields: string[];
    illustrationPhotos: string[];
    timestamp: number | Date
}

export async function resolveMediaSources(audio: (HTMLAudioElement | HTMLImageElement)[], resolveMediaSrc: (s: string) => Promise<string>) {
    const sources = [];
    for (let i = 0; i < audio.length; i++) {
        const mediaTag = audio[i];
        let attribute = mediaTag.getAttribute('src');
        if (!attribute) {
            throw new Error('image no source');
        }
        let src = await resolveMediaSrc(attribute || '');
        mediaTag.setAttribute('src', src);
        sources.push(src)
    }
    return sources;
}

export async function GetICard(
    fields: string[],
    resolveMediaSrc: (s: string) => Promise<string>,
    deck: string,
    ankiPackage: string,
    collection: string
): Promise<ICard> {
    fields = fields.filter(f => f);
    const c: ICard = {
        learningLanguage: fields[0], // assuming the first field contains the character
        photos: [],
        sounds: [],
        knownLanguage: [],
        ankiPackage: ankiPackage,
        collection: collection,
        deck: deck,
        fields: [],
        illustrationPhotos: [],
        timestamp: Number.MIN_SAFE_INTEGER // Notes imported have the lowest timestamp because they're meant to be over-written
    }
    const soundMatchRegexp = new RegExp(`\\[sound:(.*?)\\]`);
    for (let i = 0; i < fields.length; i++) {
        let field = fields[i];
        const groups = soundMatchRegexp.exec(field);
        if (groups || field.includes('sound:')) {
            field = `<audio src="${(groups || [])[1]}"/>` // I dont know if this will work
        }

        let parser = new DOMParser(
            {
                errorHandler: {
                    warning: function () {
                    }
                },
            }
        );
        const document = parser.parseFromString(field, 'text/html');
        if (!document) {
            debugger;
            console.log();
        }
        const audio = Array.from(document.getElementsByTagName('audio'));
        const images = Array.from(document.getElementsByTagName('img'));
        const audioSources = await resolveMediaSources(audio, resolveMediaSrc);
        const imageSources = await resolveMediaSources(images, resolveMediaSrc);
        c.sounds.push(...audioSources);
        // For this current package, the photos will always be illustrationPhotos
        c.illustrationPhotos.push(...imageSources);
        let innerHTML = new XMLSerializer().serializeToString(document);
        if (!innerHTML) {
            debugger;
            console.log();
        }
        if (innerHTML === '??') {
            debugger;
            console.log('Inner html ??');
        }
/*
        c.fields.push(innerHTML);
*/
    }
    return c;
}


export function getIsMeFunction(c1: ICard) {
    return ({deck, ankiPackage, collection, learningLanguage, id}: {
        deck: string | undefined,
        ankiPackage: string | undefined,
        collection: string | undefined,
        learningLanguage: string,
        id?: number | undefined
    }) =>
        (c1.id && (c1.id === id)) ||
        (c1.deck === deck &&
            c1.ankiPackage === ankiPackage &&
            c1.collection === collection &&
            c1.learningLanguage === learningLanguage);
}