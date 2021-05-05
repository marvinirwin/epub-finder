import { Card } from '../entities/card.entity'

const toDataURL = url => fetch(url)
    .then(response => response.blob())
    .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    }))


toDataURL('https://www.gravatar.com/avatar/d50c83cc0c6523b4d3f6085295c953e0')
    .then(dataUrl => {
        console.log('RESULT:', dataUrl)
    })

export const SerializeCardForCsv = async (
    {
        c,
        learningToKnownTransliterationConfig,
        learningToKnowTranslationConfig
    }: {
    c: Card
}) => {
    return {
        photo: await toDataURL(c.photos[0]),
        // What extension does this file have?
        sound: await toDataURL(c.sounds[0]),
        description: c.known_language[0],
        romanization: learningToKnowTranslationConfig ? fetchTransliteration(learningToKnowTranslationConfig) : '',
        learningLanguage: learningToKnowTranslationConfig ? fetchTranslation(learningToKnowTranslationConfig) : '',
    }
}