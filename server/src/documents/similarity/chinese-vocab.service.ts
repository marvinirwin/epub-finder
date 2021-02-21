import {join} from 'path'
import {promises as fs} from "fs";
export class ChineseVocabService {
    public vocab: Promise<string[]>;
    constructor() {
        this.vocab = fs.readFile(join(__dirname, '../../../../reader/public/all_chinese_words.csv'))
            .then(buffer => buffer.toString('utf8')
                .split('\n')
                .map((word: string) => word.trim()))

    }
}