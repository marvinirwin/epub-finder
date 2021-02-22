export interface ICard {
    id?: number; // Primary key. Optional (autoincremented)
    learningLanguage: string;
    photos: string[];
    sounds: string[];
    knownLanguage: string[];
    deck: string | undefined;
    fields: string[];
    illustrationPhotos: string[];
    timestamp: number | Date;

    // Only created for purposes of highlight
    highlightOnly?: boolean;
    // Created by the program and never interacted with by the user
    synthetic?: boolean;
}

export async function resolveMediaSources(audio: (HTMLAudioElement | HTMLImageElement)[], resolveMediaSrc: (s: string) => Promise<string>) {
    const sources = [];
    for (let i = 0; i < audio.length; i++) {
        const mediaTag = audio[i];
        const attribute = mediaTag.getAttribute('src');
        if (!attribute) {
            throw new Error('image no source');
        }
        const src = await resolveMediaSrc(attribute || '');
        mediaTag.setAttribute('src', src);
        sources.push(src)
    }
    return sources;
}

export function getIsMeFunction(c1: ICard) {
    return ({deck, learningLanguage, id}: {
        deck: string | undefined,
        learningLanguage: string,
        id?: number | undefined
    }) =>
        (c1.id && (c1.id === id)) ||
        (c1.deck === deck && c1.learningLanguage === learningLanguage);
}