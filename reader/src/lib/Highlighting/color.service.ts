import {blendColors} from "./blend-colors.service";

export type RGBA = [number, number, number, number];
/**
 * This could be a generator
 * That's too fancy for now
 * @param h
 */
export const mixRGBA = (h: RGBA[] | undefined): string => {
    if (!h) return `transparent`;
    const colors = [...h.values()];
    if (!colors.length) return `transparent`;
    return `RGBA(${blendColors(colors)})`
}