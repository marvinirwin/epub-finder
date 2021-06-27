export const audioContext = new Promise<AudioContext>((resolve) => {
    setTimeout(() => {
        // @ts-ignore
        resolve(new (window.AudioContext || window.webkitAudioContext)())
    }, 1000)
})
