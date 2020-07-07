export function getNewICardForWord(word: string, deck: string) {
    return {
        learningLanguage: word,
        photos: [],
        sounds: [],
        knownLanguage: [],
        deck: deck,
        fields: [],
        illustrationPhotos: [],
        timestamp: new Date()
    };
}

export const sleep = (n: number) => new Promise(resolve => setTimeout(resolve, n))