import {Test} from '@nestjs/testing';
import {TabulateService} from "../src/documents/similarity/tabulate.service";
import {DocumentsModule} from "../src/documents/documents.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Document} from "../src/entities/document.entity";
import {DocumentView} from "../src/entities/document-view.entity";
import {User} from "../src/entities/user.entity";
import {DatabaseModule} from "../src/config/database.module";

describe('document tabulation', () => {
    let tabulateService: TabulateService;
    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                DatabaseModule,
                TypeOrmModule.forFeature([Document, DocumentView, User]),
                DocumentsModule
            ],

        }).compile();

        tabulateService = moduleRef.get<TabulateService>(TabulateService);
    });
    it('tabulates Simplified Chinese documents',
        async () => {
            const tabulation = await tabulateService.tabulate(
                {where: {name: "Test Html"}},
                ['今天', '今', '天']
            );
            expect(tabulation.wordCounts).toMatchObject({'今天': 1, '今': 1, '天': 1});
        }
    );
    it(
        'Greedily tabulates documents', async () => {
            const tabulation = await tabulateService.tabulateNoCache(
                {where: {name: "Test Html"}},
                ['你好', '你', '好']
            );
            expect(tabulation.greedyWordCounts.get('你好')).toBe(1);
            expect(tabulation.greedyWordCounts.get('你')).toBeFalsy()
        }
    );
    it('Calculates regular word counts, greedy work counts, cross segment counting', async () => {
        const tabulation = await tabulateService.tabulateNoCache(
            {where: {name: "Test Html 3 Sentences"}},
            ['你好', '你', '好', '今', '天', '今天']
        );
        expect(tabulation.greedyWordCounts.get('你好')).toBe(2);
        expect(tabulation.greedyWordCounts.get('今天')).toBe(2);
        expect(tabulation.wordCounts).toEqual({
            "你好": 2,
            "你": 2,
            "好": 2,
            "今天": 2,
            "今": 2,
            "天": 2
        });

    })
})