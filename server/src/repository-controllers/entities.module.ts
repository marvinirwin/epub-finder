import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserSetting } from '../entities/user-setting.entity'
import { UserSettingView } from '../entities/user-setting-view.entity'
import { Card } from '../entities/card.entity'
import { SpacedRepitionEntity } from '../entities/spaced-repitition-record.entity'
import { IgnoredWord } from '../entities/ignored-word.entity'
import { CustomWord } from '../entities/custom-word.entity'
import { EntitiesController } from './entities.controller'
import { EntitiesService } from './entities.service'
import { CardView } from '../entities/card-view.entity'
import { IgnoredWordView } from '../entities/ignored-word-view.entity'
import { KnownWord } from '../entities/known-word.entity'
import { KnownWordView } from '../entities/known-word-view.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature(
            [
                UserSetting,
                UserSettingView,
                Card,
                SpacedRepitionEntity,
                IgnoredWord,
                CustomWord,
                CardView,
                IgnoredWord,
                IgnoredWordView,
                KnownWord,
                KnownWordView
            ],
        ),
    ],
    controllers: [
        EntitiesController
    ],
    providers: [
        EntitiesService,
    ],
})
export class EntitiesModule {
}
