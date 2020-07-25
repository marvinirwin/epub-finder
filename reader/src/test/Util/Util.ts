import {AtomizedDocument} from "../../lib/Atomize/AtomizedDocument";
import {readFileSync} from "fs-extra";
import {join} from "path";
import {Dictionary} from "lodash";
import {RecognitionMap} from "../../lib/Scheduling/SRM";

export function getAtomizedSentences(paths: string) {
    return AtomizedDocument.atomizeDocument(readFileSync(join(__dirname, '../fixtures', paths)).toString())
        .getAtomizedSentences();
}

export class Marbles {
    public values: Dictionary<any> = {};
    private currentLetter = 'a';
    public marbles: string[] = [];

    push(...arr: any) {
        const lettersAdded = [];
        for (let i = 0; i < arr.length; i++) {
            const v = arr[i];
            this.values[this.currentLetter] = v;
            lettersAdded.push(this.currentLetter);
            this.currentLetter = incLetter(this.currentLetter);
        }
        this.marbles.push(`(${lettersAdded.join('')})`)
    }

    addTime() {
        this.marbles.push('-')
    }

    getMarbles(): string {
        return this.marbles.join('')
    }
}

export function incLetter(l: string) {
    return String.fromCharCode(l.charCodeAt(0) + 1);
}

export function countFactory(word: string) {
    return {
        word,
        count: 1,
        book: ''
    }
}

let recognitionIdCounter = 0;

export function recognitionFactory(word: string, score?: number) {
    return {
        word,
        timestamp: new Date(),
        recognitionScore: score || RecognitionMap.easy,
        id: ++recognitionIdCounter
    }
}