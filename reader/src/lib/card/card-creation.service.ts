import CardsRepository from "../Manager/cards.repository";
import {PronunciationProgressService} from "../schedule/pronunciation-progress.service";
import {WordRecognitionProgressService} from "../schedule/word-recognition-progress.service";
import {OpenDocumentsService} from "../Manager/open-documents.service";

export class CardCreationService {
    constructor(
        {
            cardService,
            pronunciationProgressService,
            wordRecognitionService,
            openDocumentsService
        }: {
            cardService: CardsRepository,
            pronunciationProgressService: PronunciationProgressService,
            wordRecognitionService: WordRecognitionProgressService,
            openDocumentsService: OpenDocumentsService
        }) {
        function putWords(records: {word: string}[]) {
            cardService.putSyntheticWords(records.map(r => r.word))
        }
        pronunciationProgressService.addRecords$.subscribe(putWords);
        wordRecognitionService.addRecords$.subscribe(putWords);
        openDocumentsService.displayDocumentTabulation$
            .subscribe(tabulation => {
                cardService.putSyntheticWords(Object.keys(tabulation.wordCounts))
            })
    }
}