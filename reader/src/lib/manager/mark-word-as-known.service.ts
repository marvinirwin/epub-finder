import { HotkeysService } from '../../services/hotkeys.service'
import { KnownWordsRepository } from '../schedule/known-words.repository'

export class MarkWordAsKnownService {
    constructor(
        {
            hotkeysService,
            knownWordsRepository
        }: {
            hotkeysService: HotkeysService,
            knownWordsRepository: KnownWordsRepository
        }) {
    }
}