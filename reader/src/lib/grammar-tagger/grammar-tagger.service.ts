const result = {
    "spans": [
        {
            "span": [2, 5],
            "tokens": ["住", "得", "很", "远"],
            "label": "2.12.1:V 得 A:(using adverbs)"
        },
        {
            "span": [4, 4],
            "tokens": ["很"],
            "label": "1.06.2:很:very"
        },
        {
            "span": [8, 8],
            "tokens": ["想"],
            "label": "1.08.1:想:to want"
        }
    ],
    "tokens": ["[CLS]", "她", "住", "得", "很", "远", "，", "我", "想", "送", "她", "回", "去", "。", "[SEP]"],
    "level_probs": {
        "HSK 6": 9.971807230613194e-06,
        "HSK 5": 0.0011904890416190028,
        "HSK 3": 0.005279902834445238,
        "HSK 4": 0.00014815296162851155,
        "HSK 2": 0.9917035102844238,
        "HSK 1": 0.0016456041485071182
    }
}

type Rectangle = {
    start: number;
    end: number;
    height: number;
}

const MAX_GRAMMAR_TAG_HEIGHT = 100;
const placeRectangle = ({existingRectangles, newRectangle}: {existingRectangles: Rectangle[] , newRectangle: Rectangle}) => {
    const getOverLappingRectangles = (): Rectangle[] => {
        return []; // TODO
    }
    const surroundingOrInterceptingRectangles = getOverLappingRectangles();
    /**
     * Now find the our height by finding a height which isn't taken by our overlapping rectangles
     */
    for (let potentialHeight = 1; potentialHeight < MAX_GRAMMAR_TAG_HEIGHT; potentialHeight++) {
        /**
         * As long as we don't have the same height as our overlappers we should be fine?  It might look jagged, but that's probably fine
         */
        const overlappingHeight = surroundingOrInterceptingRectangles.find(({height}) => height === potentialHeight)
    }
    return []; // TODO
}

export const fetchGrammar = async () => {
    return result;
}
