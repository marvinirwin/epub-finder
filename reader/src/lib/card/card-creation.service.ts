import CardsRepository from "../manager/cards.repository";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {OpenDocumentsService} from "../manager/open-documents.service";

export class CardCreationService {
    constructor(
        {
            cardService,
            pronunciationProgressService,
            wordRecognitionService,
            openDocumentsService
        }: {
            cardService: CardsRepository,
            pronunciationProgressService: PronunciationProgressRepository,
            wordRecognitionService: WordRecognitionProgressRepository,
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