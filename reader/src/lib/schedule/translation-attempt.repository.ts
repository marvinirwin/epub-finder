import {IndexedRowsRepository} from './indexed-rows.repository'
import {DatabaseService} from '../Storage/database.service'
import {SuperMemoGrade} from 'supermemo'
import {emptyGenerator} from './pronunciation-progress.repository'
import {LoadingWrapperService} from "../loading/loadingService";
import {LoggedInUserService} from "../auth/logged-in-user.service";

export interface TranslationAttemptRecord {
    id: number
    creator_id: number | string;
    learningLanguage: string
    translationAttempt: string
    created_at: Date
    nextDueDate: Date

    interval: number
    repetition: number
    efactor: number
    grade: SuperMemoGrade
}

export class TranslationAttemptRepository extends IndexedRowsRepository<TranslationAttemptRecord> {
    constructor(
        {
            databaseService,
            loadingWrapperService,
            loggedInUserService
        }: {
            databaseService: DatabaseService,
            loadingWrapperService: LoadingWrapperService,
            loggedInUserService: LoggedInUserService
        }) {
        super({
            databaseService,
            load: emptyGenerator,
            add: (r) => Promise.resolve(r as TranslationAttemptRecord),
            getIndexValue: (r) => ({indexValue: r.learningLanguage}),
            loadingWrapperService,
            loggedInUserService
        })
    }
}
