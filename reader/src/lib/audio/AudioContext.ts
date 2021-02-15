export const audioContext = new Promise<AudioContext>(resolve => {
    setTimeout(() => {
        resolve(new AudioContext())
    }, 1000)
})