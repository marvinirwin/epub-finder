import { Card } from "src/entities/card.entity";

export type ICard = Card;

export async function resolveMediaSources(
    audio: (HTMLAudioElement | HTMLImageElement)[],
    resolveMediaSrc: (s: string) => Promise<string>,
) {
    const sources = []
    for (let i = 0; i < audio.length; i++) {
        const mediaTag = audio[i]
        const attribute = mediaTag.getAttribute('src')
        if (!attribute) {
            throw new Error('image no source')
        }
        const src = await resolveMediaSrc(attribute || '')
        mediaTag.setAttribute('src', src)
        sources.push(src)
    }
    return sources
}

export function getIsMeFunction(c1: ICard) {
    return ({
        deck,
        learningLanguage,
        id,
    }: {
        deck: string | undefined
        learningLanguage: string
        id?: string | undefined
    }) =>
        (c1.id && c1.id === id) ||
        (c1.learning_language === learningLanguage)
}
