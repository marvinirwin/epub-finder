import {VideoMetaData} from "../components/PronunciationVideo/video-meta-data.interface";

async function digestMessage(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message.normalize("NFC"));
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sentenceToFilename(sentence: string): Promise<string> {
    return digestMessage(sentence.normalize().replace(/\s+/, ' '));
}

export const fetchVideoMetadata = async (sentence: string): Promise<VideoMetaData | undefined> => {
    try {
        const response = await fetch(`${process.env.PUBLIC_URL}/video/${await sentenceToFilename(sentence)}.json`)
        if (response.status === 200) {
            return response.json() as unknown as VideoMetaData;
        }
    } catch (e) {
    }
}

