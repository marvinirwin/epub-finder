import {Subject} from "rxjs";
import {Website} from "../../lib/Website/Website";
import {CausalTree} from "../Graph/CausalTree";

export function AddPageScheduleCardsQuizzingCard(addPage$: Subject<Website>) {
    return CausalTree.init(`
          sentences
             ^
             |
        quizzingCard
             ^
             |
       scheduledCards
             ^
             |
    addPage$.next(mainPage)
    `, {
        sentences: [
            '一二三四五六七八九十一二三四五六七八九十一二三四五六七八九十,',
            '一二三四五六七八九十'
        ],
        scheduledCards: [
            {
                learningLanguage: '今天',
            }
        ],
        quizzingCard: {
            learningLanguage: '今天'
        },
        mainPage: {
            name: "Basic Doc"
        },
        addPage$
    });
}