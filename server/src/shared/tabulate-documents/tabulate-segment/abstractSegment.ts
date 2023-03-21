import {AbstractNode} from "./abstractNode";

export type AbstractSegment<T extends AbstractNode> = {
    children: T[];
    textContent: string | null;
    translatableText: string;
};