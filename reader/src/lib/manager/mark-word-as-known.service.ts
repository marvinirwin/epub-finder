import { HotkeysService } from '../../services/hotkeys.service'

export class MarkWordAsKnownService {
    constructor(
        {
            hotkeysService,
            knownWordsRepository
        }: {
            hotkeysService: HotkeysService,
        }) {
    }
}