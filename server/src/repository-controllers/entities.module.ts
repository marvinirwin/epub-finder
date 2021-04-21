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
                CardView
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
