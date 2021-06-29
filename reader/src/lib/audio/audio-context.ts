import { AudioContext } from 'standardized-audio-context';

export const audioContext = new Promise<AudioContext>((resolve) => {
    setTimeout(() => {
        // @ts-ignore
        resolve(new AudioContext())
    }, 1000)
})
