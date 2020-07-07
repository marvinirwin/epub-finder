import {getAtomizedSentences} from "./Util/Util";
import CardManager from "../lib/Manager/CardManager";

test('Unpersisted cards added produce new elemnents on the wordmap', async () => {
    const cardManager = new CardManager();
    const atomizedSentences = getAtomizedSentences('BasicDoc');
})