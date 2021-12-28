import { Test } from '@nestjs/testing'
import { TabulateService } from '../src/documents/similarity/tabulate.service'
import { DocumentsModule } from '../src/documents/documents.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Document } from '../src/entities/document.entity'
import { DocumentView } from '../src/entities/document-view.entity'
import { User } from '../src/entities/user.entity'
import { DatabaseModule } from '../src/config/database.module'
import { wordsFromCountRecordList } from '../src/shared/tabulation/word-count-records.module'
import { AtomizedDocument, InterpolateService, tabulate } from '../src/shared'
import { ChineseVocabService } from '../src/shared/tabulate-documents/chinese-vocab.service'
import { SetWithUniqueLengths } from '../src/shared/tabulate-documents/set-with-unique-lengths'
import { chineseCharacterRegexp, wordBoundaryRegexp } from '../src/shared/tabulation/word-separator'

const tabulateHtml3 = async (tabulateService: TabulateService) =>
    await tabulateService.tabulateRemoteDocumentNoCach(
        { where: { name: 'Test Html 3 Sentences' } },
        [
            '你好',
            '你',
            '好',
            '今',
            '天',
            '今天',
            '之',
            '所以',
            '所',
            '以',
            '搞出',
            '出',
            '搞',
            '这么多',
            '大',
            '内乱',
            '内',
            '乱',
            '原因',
            '主要',
            '主',
            '要',
            '这几点',
            '这',
            '几点',
        ],
        'zh-Hans'
    )

async function tabulateChineseSentence(...chineseSegments: string[]) {
    const chineseVocabSet = new SetWithUniqueLengths(
        await ChineseVocabService.vocab(),
    )
    return tabulate({
        notableCharacterSequences: chineseVocabSet,
        segments: AtomizedDocument.atomizeDocument(
            InterpolateService.sentences(chineseSegments),
        ).segments(),
        greedyWordSet: chineseVocabSet,
        isNotableCharacterRegex: chineseCharacterRegexp,
        isWordBoundaryRegex: wordBoundaryRegexp,
        wordIdentifyingStrategy: 'noSeparator',
        language_code: 'zh-Hans'
    })
}

describe('document tabulation', () => {
    let tabulateService: TabulateService
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                DatabaseModule,
                TypeOrmModule.forFeature([Document, DocumentView, User]),
                DocumentsModule,
            ],
        }).compile()

        tabulateService = moduleRef.get<TabulateService>(TabulateService)
    })
    it('tabulates Simplified Chinese documents', async () => {
        const tabulation = await tabulateService.tabulateRemoteDocument(
            { where: { name: 'Test Html' } },
            ['今天', '今', '天'],
            'zh-Hans',
        )
        expect(tabulation.wordCounts).toMatchObject({ 今天: 1, 今: 1, 天: 1 })
    })
    it('Greedily tabulates documents', async () => {
        const tabulation = await tabulateService.tabulateRemoteDocumentNoCach(
            { where: { name: 'Test Html' } },
            ['你好', '你', '好'],
            'zh-Hans',
        )
        expect(tabulation.greedyWordCounts.get('你好')).toBe(1)
        expect(tabulation.greedyWordCounts.get('你')).toBeFalsy()
    })
    it('Calculates regular word counts, greedy work counts, cross segment counting', async () => {
        const tabulation = await tabulateHtml3(tabulateService)
        expect(tabulation.greedyWordCounts.get('你好')).toBe(2)
        expect(tabulation.greedyWordCounts.get('今天')).toBe(2)
        expect(tabulation.wordCounts).toEqual({
            你好: 2,
            你: 2,
            好: 2,
            今天: 2,
            今: 2,
            天: 2,
        })
    })
    it('Counts word records', async () => {
        const tabulation = await tabulateHtml3(tabulateService)
        // @ts-ignore
        const segmentWord = [...tabulation.segmentWordCountRecordsMap.values()]
        const countRecords = wordsFromCountRecordList(
            segmentWord[segmentWord.length - 1],
        )
        expect(countRecords).toHaveLength(9)
    })
    it('tabulates sentences with vocab', async () => {
        const tabulation3 = await tabulateChineseSentence(
            '我妈都会说: “老头子，怎么又抽烟了?!” “儿子能抽我为什么不能抽?”\n' ,
            '我爸应该是听到我和我妈的对话了，好—招先下 手为强!\n' ,
            '“儿子那么多好的你不学，干吗学坏的?” “好在哪里?”\n' ,
            '他们这么—来二去，针锋相对之后，竟然在这里 卡壳了。\n' ,
            '我妈只能吞吞吐吐地说: " 儿子说脱口秀，讲讲 你的缺点还是蛮好笑的。"\n' ,
            '其实我偷偷抽烟并 不完全是模仿我爸。小时候我\n' ,
            '看了很多影视剧，\n' ,
            '影视剧里抽烟的人就很酷。也不是\n' ,
            '所有的正面人物都抽烟， 但他们一抽烟好像就像被智 慧女神雅典娜亲吻了 一样，舌灿莲花，思如泉涌。我 印象最深的就是小 时候看的两个角色，—个是孙红雷\n' ,
            '. ,...., ,\n' ,
            ' \n' ,
            ' 饰演的刘华强，一个是李幼斌饰演的李云龙。这两个 角色性格不同，所处的历史背景也不同，相似点就是\n' ,
            '俩人一抽烟都特别有型。用 80后的话说，就是酷毙了， 帅呆了。你想啊，李云龙，七尺大汉，和日本鬼子作战， 由于敌众我寡，或者敌人太狡猾，他常常—边思考作\n' ,
            '战方案，一边喃喃自语:山本这个狗娘养的，死守平 安县城，我该怎么办昵?这时，他慢慢掏出一根烟，\n' ,
            '旁边的二营长，或者三连长见状，立刻给他点上，烟 雾缭绕中，李云龙的大脑就飞速运转起来了:对，用 他娘的意大利炮!山本想了很多醒龄的办法对付李云\n' ,
            '龙，比如偷袭大本营、绑架他老婆等，最后却都失败了。 怕是他干算万算，也算不到李将军的灵感来源是香烟。\n' ,
            '有一次，我和我爸讨论抽烟，他说现在的年轻人 爱抽什么电子烟，看上去似乎更加文雅，没有火苗更 加安全，但它本质上还是烟，还是会令人上瘾，并且\n' ,
            '气势上弱太多了。想象一下，电影里，大哥带着小弟， 烟头一馅: “兄弟们，给我上!”这个经典桥段在电',
        )
    })
})
