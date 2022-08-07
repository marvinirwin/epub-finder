import { InterpolateService } from "../interpolate.service";
import { AtomizedDocument } from "./atomized-document";
import trie from "trie-prefix-tree";
import { ChineseVocabService } from "./chinese-vocab.service";
import { tabulate } from "./tabulate-segment/tabulate";
import { resolvePartialTabulationConfig } from "../tabulation/word-separator";
import {DocumentId} from "../sourced-text";

export const TabulateChineseText = async ({text, documentId}: {text: string; documentId: DocumentId}) => {
    const notableCharacterSequencesSegmentsGreedyWordSet = trie(
        await ChineseVocabService.vocab(),
    );
    return await tabulate({
        notableCharacterSequences: notableCharacterSequencesSegmentsGreedyWordSet,
        segments: AtomizedDocument.atomizeDocument(
            {documentSrc: InterpolateService.text(text), documentId},
        ).segments(),
        greedyWordSet: notableCharacterSequencesSegmentsGreedyWordSet,
        ...resolvePartialTabulationConfig("zh-Hans"),
        language_code: "zh-Hans",
    });
};
