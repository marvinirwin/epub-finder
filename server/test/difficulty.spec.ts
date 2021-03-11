const computeDifficulty = (sentence: string, vocabulary: Map<string, number>) => {

};

describe('calculating segment difficulty', () => {
    it('Calculates difficulty correctly', () => {
        const vocabulary = new Map<string, number>([['some', 1], ['test', 2], ['sentence', 3]]);
        const sentence = 'some test sentence';
        const difficulty = computeDifficulty(sentence);
    })
})