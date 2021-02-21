import {join, normalize} from 'path'
import {promises as fs} from "fs";
export class ChineseVocabService {
    public static vocab() {
        const path = normalize(join(__dirname, '../../../../reader/public/all_chinese_words.csv'));
        return fs.readFile(path)
            .then(buffer => buffer.toString('utf8')
                .split('\n')
                .map((word: string) => word.trim()))
    }
}