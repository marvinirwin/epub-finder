import {InjectRepository} from "@nestjs/typeorm";
import {MoreThan, Repository} from "typeorm";
import {LeaderBoardDto} from "../shared/leader-board.dto";
import {SpacedRepitionEntity} from "../entities/spaced-repitition-record.entity";
import {User} from "src/entities/user.entity";
import {groupBy, uniq} from "lodash";
import id from "uuid-readable";

export class LeaderBoardService {
    constructor(
        @InjectRepository(SpacedRepitionEntity)
        private spacedRepitionEntityRepository: Repository<SpacedRepitionEntity>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {
    }

    async getLeaderBoard(): Promise<LeaderBoardDto> {
        // Get all records created_at in the last week, group them by user and then get reviewed/learnned records
        // Oh, but it's difficult to figure out if a word has been reviewed or not, without the entire list of records
        // Ok, I'll just look for score >= 3 and timestamp within this week, and your score is how many records you did per week
        // Or maybe words
        // Also, I'll need to make up labels for users deterministically based on their emails until I add a lahel column
        // to the user object
        // TODO this is correct right, javascript dates do arithmetic in seconds?
        const oneWeek = 60 * 60 * 24 * 7;
        const oneWeekAgo = +(new Date()) - oneWeek;
        // TODO check typeORM greater than/less than
        const allCreatedAtRecordsLastWeek = await this.spacedRepitionEntityRepository.find({
            where: {created_at: MoreThan(oneWeekAgo.toString())},
            order: {created_at: "DESC"}
        });
        const recordsIndexedByCreator = groupBy(allCreatedAtRecordsLastWeek, r => r.creator_id);
        const users = await this.userRepository.findByIds(uniq(allCreatedAtRecordsLastWeek.map(v => v.creator_id)));
        return {
            records: users.map(user => {
                const [latestRecord] = recordsIndexedByCreator[user.id];
                return {userLabel: id(`${user.id}`.padStart(36, "0")), lastLearned: latestRecord};
            })
        };

    }
}
