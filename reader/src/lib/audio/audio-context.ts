export const audioContext = new Promise<AudioContext>((resolve) => {
    setTimeout(() => {
        // @ts-ignore
        resolve(new (AudioContext || window.webkitAudioContext)())
    }, 1000)
})
