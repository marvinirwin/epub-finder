import {flatten} from "lodash";
import {AbstractSegment} from "./abstractSegment";

export function getAllMarks<SegmentType extends AbstractSegment<any>, NodeType>(segments: SegmentType[], elementSegmentMap: Map<NodeType, SegmentType>, wordIdentifyingStrategy: "noSeparator" | "spaceSeparator" | "thai") {
    return flatten(
        segments.map((segment) => {
            segment.children.forEach((node) =>
                elementSegmentMap.set(node, segment),
            );
            return segment.children;
        }),
    ).filter((n) => {
        const text = n.textContent as string;
        if (wordIdentifyingStrategy === "noSeparator") {
            return text.trim();
        }
        return text;
    });
}