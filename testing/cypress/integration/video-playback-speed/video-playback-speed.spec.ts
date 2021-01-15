import {ReadingPom} from "../../support/pom/reading.pom";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {PronunciationVideoPom} from "./pronunciation-video.pom";

describe('Adjusting Video Playback Speed', () => {
    beforeEach(() => {
        cy.visitHome();
    })
    it('Adjusts video playback speed', () => {
        DirectoryPom.setWatchMode(true);
        ReadingPom.Marks().click();
        PronunciationVideoPom.setPlaybackSpeed(0.5)
    })
})
