import {ITrie} from "../../../../server/src/shared/Trie";
import {LtDocument} from "@shared/*";
import {TrieWrapper} from "../TrieWrapper";
import {DocumentViewDto} from "../../../../server/src/documents/document-view.dto";

export type TabulateDocumentDto = { trieWords: string[], d: DocumentViewDto };