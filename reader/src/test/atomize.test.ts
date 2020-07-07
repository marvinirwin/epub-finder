import {AtomizedDocument} from '../lib/Atomize/AtomizedDocument';
import { readFileSync} from 'fs-extra'
import {join} from 'path'
import {TrieWrapper} from "../lib/TrieWrapper";
import trie from "trie-prefix-tree";
import {mergeWordTextNodeMap} from "../lib/Util/mergeAnnotationDictionary";
import {getAtomizedSentences} from "./Util/Util";

test('Atomizes a document and produces a mapping of words to text nodes', async () => {
    const atomizedSentences = getAtomizedSentences('BasicDoc.html')
    expect(atomizedSentences).toHaveLength(3);
    const sentenceElementMaps = atomizedSentences.map(atomizedSentence => atomizedSentence.getWordElementMemberships(
        trie(["Test"]),
        [4]
    ));
    const TestSentence1 = sentenceElementMaps[0];
    const TestSentence2 = sentenceElementMaps[1];
    expect(TestSentence1['Test']).toHaveLength(4);
    expect(TestSentence2['Test']).toHaveLength(4);
    const merged = mergeWordTextNodeMap(TestSentence1, TestSentence2);
    expect(merged["Test"]).toHaveLength(8);
});


