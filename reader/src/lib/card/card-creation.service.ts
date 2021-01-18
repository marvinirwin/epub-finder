import CardsRepository from "../Manager/cards.repository";
import {PronunciationProgressService} from "../schedule/pronunciation-progress.service";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";

export class CardCreationService {
    constructor(
        {
            cardService,
            pronunciationProgressService,
            wordRecognitionService
        }: {
            cardService: CardsRepository,
            pronunciationProgressService: PronunciationProgressService,
            wordRecognitionService: WordRecognitionProgressService,
        }) {
        function putWords(records: {word: string}[]) {
            cardService.putWords(records.map(r => r.word))
        }
        pronunciationProgressService.addRecords$.subscribe(putWords);
        wordRecognitionService.addRecords$.subscribe(putWords);
    }
}