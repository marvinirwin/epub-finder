import trie from "trie-prefix-tree";
import {mergeWordTextNodeMap} from "../../lib/Util/mergeAnnotationDictionary";
import {getAtomizedSentences} from "../Util/Util";

test('Atomizes a document and produces a mapping of words to text nodes', async () => {
    const atomizedSentences = getAtomizedSentences('BasicDoc.html')
    expect(atomizedSentences).toHaveLength(5);
    const sentenceElementMaps = atomizedSentences.map(atomizedSentence => atomizedSentence.getTextWordData(
        trie(["Test"]),
        [4]
    ));
    const TestSentence1 = sentenceElementMaps[0];
    const TestSentence2 = sentenceElementMaps[1];
    expect(TestSentence1.wordElementsMap.Test).toHaveLength(4);
    expect(TestSentence2.wordElementsMap.Test).toHaveLength(4);
    const merged = mergeWordTextNodeMap(TestSentence1.wordElementsMap, TestSentence2.wordElementsMap);
    expect(merged.Test).toHaveLength(8);
});


