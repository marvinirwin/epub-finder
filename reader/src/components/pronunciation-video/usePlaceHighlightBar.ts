import {useEffect} from "react";

export const usePlaceHighlightBar = (
    highlightBar: HTMLDivElement | null | undefined,
    sectionContainer: HTMLDivElement | null | undefined,
    highlightStartPosition: number | undefined,
    highlightEndPosition: number | undefined,
) => {
    useEffect(() => {
        if (highlightBar && sectionContainer) {
            if (highlightStartPosition === undefined || highlightEndPosition === undefined) {
            } else {
                highlightBar.style.left = `${highlightStartPosition * sectionContainer.clientWidth}px`;
            }
        }

    }, [highlightStartPosition, highlightEndPosition, sectionContainer, highlightBar]);

    useEffect(() => {
        if (highlightBar && sectionContainer) {
            if (highlightEndPosition === undefined || highlightStartPosition === undefined) {
                highlightBar.style.width = '0';
            } else {
                highlightBar.style.width = `${(highlightEndPosition - highlightStartPosition) * sectionContainer.clientWidth}px`;
            }
        }
    }, [highlightEndPosition, sectionContainer, highlightBar])
}