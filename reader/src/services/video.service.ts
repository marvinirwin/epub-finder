import {VideoMetadata} from "../types/";
import axios from 'axios';

async function digestMessage(message: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(message.normalize("NFC"));
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha1(sentence: string): Promise<string> {
    return digestMessage(sentence.normalize().replace(/\s+/, ' '));
}

export const fetchVideoMetadata = async (sentence: string): Promise<VideoMetadata | undefined> => {
    try {
        const response = await fetch(`${process.env.PUBLIC_URL}/video_metadata/${await sha1(sentence)}`)
        if (response.status === 200) {
            return await response.json() as unknown as VideoMetadata;
        }
    } catch (e) {
        console.warn(e);
    }
}

type BulkMetadataDto = { [sentence: string]: VideoMetadata | undefined };
export const fetchBulkMetadata = async (sentences: string[]): Promise<BulkMetadataDto | undefined> => {
    try {
        const response = await axios.post(`${process.env.PUBLIC_URL}/video_metadata/`, sentences);
        if (response.status === 200) {
            return await response.data as unknown as BulkMetadataDto;
        }
    } catch (e) {
        console.warn(e);
    }
}
