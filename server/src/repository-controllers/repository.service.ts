import { Controller } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { UserSetting } from '../entities/user-setting.entity'
import { UserSettingView } from '../entities/user-setting-view.entity'
import { Card } from '../entities/card.entity'
import { SpacedRepitionEntity } from '../entities/spaced-repitition-record.entity'
import { IgnoredWord } from '../entities/ignored-word.entity'
import { CustomWord } from '../entities/custom-word.entity'
import { RepositoryType } from './repository.controller'

@Controller('repositories')
export class RepositoryService {
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
    ) {
        this.entityMap = {
            userSettings: { view: userSettingView, write: userSettings },
            cards,
            spacedRepitionEntities,
            ignoredWords,
            customWords,
        }
    }
}