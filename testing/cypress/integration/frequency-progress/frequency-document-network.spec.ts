import {hsk1Node, QUIZ_BUTTON_EASY, testNode1, testNode2} from "@shared/*";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {SimilarityResults} from "../../../../server/src/shared/compre-similarity-result";
import {TabulateChineseText} from "../../../../server/src/shared/tabulate-documents/tabulate-chinese-string";
import Chainable = Cypress.Chainable;
import {DocumentSimilarityService} from "../../../../server/src/documents/similarity/document-similarity.service";
import {computeSimilarityTabulation} from "../../../../server/src/shared/similarity-result.interface";

const testFrequencyDocument1 = 'Test Freq1';
const testFrequencyDocument2 = 'Test Freq2';
const hsk1 = 'Hsk1';

const assertLabelAndCount = (node: string, counts: SimilarityResults) => {
    const findNodeContainer = () => cy.get(`#${node}`);
    findNodeContainer().should('exist')
/*
        .contains(JSON.stringify(counts))
*/
};

const compareSimilarity = async (document1Text: string, document2Text: string): Promise<SimilarityResults> => {
    return computeSimilarityTabulation(
        await TabulateChineseText(document1Text),
        await TabulateChineseText(document2Text)
    )
};

const readFreqFixture = (filename: string): Chainable<string> => {
    return cy.fixture(`frequency-documents/${filename}`, 'utf-8')
}

function getMap() {
    return {
        testFrequencyDocument1: readFreqFixture('test-freq1.txt').promisify(),
        testFrequencyDocument2: readFreqFixture('test-freq2.txt').promisify(),
        hsk1: readFreqFixture('hsk1.txt').promisify()
    };
}

describe('Shows progress on frequency documents', () => {
    beforeEach(() => {
        cy.visitHome();
        cy.clearIndexedDB();
    })
    it('Opens the default graph', async () => {
        const map = getMap()
        DirectoryPom.OpenProgressTree();
        assertLabelAndCount(hsk1, await compareSimilarity(await map.hsk1, await map.hsk1) );
        assertLabelAndCount(testFrequencyDocument1, await compareSimilarity(await map.hsk1, await map.testFrequencyDocument1) )
        assertLabelAndCount(testFrequencyDocument2, await compareSimilarity(await map.hsk1, await map.testFrequencyDocument2) )
    });
    it('Allows the user to click a node and then see the tree from that node\s perspective', async () => {
        const map = getMap();
        DirectoryPom.OpenProgressTree();
        cy.get(`#${testNode1}`).click();
        assertLabelAndCount(testFrequencyDocument1, await compareSimilarity(await map.testFrequencyDocument1, await map.testFrequencyDocument1))
        assertLabelAndCount(hsk1, await compareSimilarity(await map.testFrequencyDocument1, await map.hsk1))
        assertLabelAndCount(testFrequencyDocument2, await compareSimilarity(await map.testFrequencyDocument1, await map.testFrequencyDocument2))
    });
})
