import {boundedPoints, orderedPoints} from "./math.module";

export class PronunciationSection {
    constructor(private c: {
        sectionLengthMs: number,
        lineIndex: number,
        firstCharacterIndex: number,
        videoTimeMs?: number,
        highlightBarStartMs?: number,
        highlightBarEndMs?: number,
    }) {
    }

    sectionStartMs() {
        return (this.c.lineIndex * this.c.sectionLengthMs);
    }

    sectionEndMs() {
        return this.sectionStartMs() * this.c.sectionLengthMs;
    }

    timeBarFraction(): number | undefined {
        // timeBarIsOutsideOfThisSection
        const videoTimeMs = this.c.videoTimeMs;
        if (!videoTimeMs || this.timeBarSectionIndex() !== this.c.lineIndex) return undefined;

        return this.positionFraction(videoTimeMs);
    }

    highlightBarPoints(): number[] | undefined {
        const start = this.highlightBarStartPositionFraction();
        const end = this.highlightBarEndPositionFraction();
        // hasPoints
        if (start !== undefined && end !== undefined) {
            const ordered = orderedPoints(start, end);
            return boundedPoints(
                ordered[0],
                ordered[1],
                0,
                1
            )
        }
    }

    /**
     * When mousing over a section, give this function a position (Let's say 25% of the length of the section)
     * and it will return the highlight bar's position in ms
     * @param fraction
     */
    highlightBarNewPosition(fraction: number) {
        return this.sectionStartMs() + (this.c.sectionLengthMs * fraction)
    }

    /**
     * When a section is clicked at 25% of the way through this function will tell you what timestamp to put the
     * video at
     * @param fraction
     */
    newVideoTimeMs(fraction: number) {
        return this.sectionStartMs() + (this.c.sectionLengthMs * fraction);
    }

    private highlightBarStartPositionFraction(): number | undefined {
        if (!this.c.highlightBarStartMs || !this.c.highlightBarEndMs) return;
        // THe start fraction is the highlight bar's position in the section
        return this.positionFraction(this.c.highlightBarStartMs);
    }

    private highlightBarEndPositionFraction(): number | undefined {
        if (!this.c.highlightBarStartMs || !this.c.highlightBarEndMs) return;
        return this.positionFraction(this.c.highlightBarEndMs);
    }

    private timeBarSectionIndex(): number | undefined {
        return this.c.videoTimeMs && Math.floor(this.c.videoTimeMs / this.c.sectionLengthMs);
    }

    /**
     * Returns the position of a number of ms on this section.
     * If the number is negative, that means it's on a previous section
     * Over 0, it's on a section after this
     * @param timeInMs
     */
    private positionFraction(timeInMs: number) {
        return (timeInMs - this.sectionStartMs()) / this.c.sectionLengthMs;
    }
}