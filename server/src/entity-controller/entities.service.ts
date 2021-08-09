import { Controller } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { UserSetting } from '../entities/user-setting.entity'
import { UserSettingView } from '../entities/user-setting-view.entity'
import { Card } from '../entities/card.entity'
import { SpacedRepitionEntity } from '../entities/spaced-repitition-record.entity'
import { IgnoredWord } from '../entities/ignored-word.entity'
import { CustomWord } from '../entities/custom-word.entity'
import { RepositoryType } from './entities.controller'
import { CardView } from '../entities/card-view.entity'
import { IgnoredWordView } from '../entities/ignored-word-view.entity'
import { KnownWordView } from '../entities/known-word-view.entity'
import { KnownWord } from '../entities/known-word.entity'

@Controller('repositories')
export class EntitiesService {
    public entityMap: {
        [key: string]: Repository<any> | RepositoryType
    }

    constructor(
        @InjectRepository(UserSetting)
        public userSettings: Repository<UserSetting>,
        @InjectRepository(UserSettingView)
        public userSettingView: Repository<UserSettingView>,
        @InjectRepository(Card)
        public cards: Repository<Card>,
        @InjectRepository(SpacedRepitionEntity)
        public spacedRepitionEntities: Repository<SpacedRepitionEntity>,
        @InjectRepository(IgnoredWord)
        public ignoredWords: Repository<IgnoredWord>,
        @InjectRepository(CustomWord)
        public customWords: Repository<CustomWord>,
        @InjectRepository(CardView)
        public cardView: Repository<CardView>,
        @InjectRepository(IgnoredWordView)
        public ignoredWordView: Repository<IgnoredWordView>,
        @InjectRepository(KnownWord)
        public knownWord: Repository<KnownWord>,
        @InjectRepository(KnownWordView)
        public knownWordView: Repository<KnownWordView>,
    ) {
        this.entityMap = {
            userSettings: { view: userSettingView, write: userSettings },
            cards: { view: cardView, write: cards },
            spacedRepitionEntities,
            ignoredWords: { view: ignoredWordView, write: ignoredWords },
            knownWords: { view: knownWordView, write: knownWord },
            customWords,
        }
    }
}