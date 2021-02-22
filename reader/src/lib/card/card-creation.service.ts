import CardsRepository from "../manager/cards.repository";
import {PronunciationProgressRepository} from "../schedule/pronunciation-progress.repository";
import {WordRecognitionProgressRepository} from "../schedule/word-recognition-progress.repository";
import {OpenDocumentsService} from "../manager/open-documents.service";

export class CardCreationService {
    constructor(
        {
            cardsRepository,
            pronunciationProgressService,
            wordRecognitionProgressService,
            openDocumentsService
        }: {
            cardsRepository: CardsRepository,
            pronunciationProgressService: PronunciationProgressRepository,
            wordRecognitionProgressService: WordRecognitionProgressRepository,
            openDocumentsService: OpenDocumentsService
        }) {
        function putWords(records: {word: string}[]) {
            cardsRepository.putSyntheticWords(records.map(r => r.word))
        }
        pronunciationProgressService.addRecords$.subscribe(putWords);
        wordRecognitionProgressService.addRecords$.subscribe(putWords);
        openDocumentsService.displayDocumentTabulation$
            .subscribe(tabulation => {
                cardsRepository.putSyntheticWords(Object.keys(tabulation.wordCounts))
            })
    }
}