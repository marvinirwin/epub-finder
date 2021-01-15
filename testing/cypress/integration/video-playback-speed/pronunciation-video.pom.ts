export class PronunciationVideoPom {
    public static setPlaybackSpeed(n: number) {
        // I have no idea if playback speed is a select component
        PronunciationVideoPom.playbackSpeed().select(`${n}`);
    }
    public static playbackSpeed() {
        return cy.get('#playback-speed-slider')
    }
}