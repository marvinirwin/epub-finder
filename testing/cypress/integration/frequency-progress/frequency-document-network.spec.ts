import {hsk1Node, QUIZ_BUTTON_EASY, testNode1, testNode2} from "@shared/*";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizPom} from "../../support/pom/quiz.pom";
import {SimilarityResults} from "../../../../server/src/shared/compre-similarity-result";
import {TabulateChineseText} from "../../../../server/src/shared/tabulate-documents/tabulate-chinese-string";

const testFrequencyDocument1 = 'Test Freq1';
const testFrequencyDocument2 = 'Test Freq2';
const hsk1 = 'Hsk1';

const assertLabelAndCount = (hsk1Node1: string, counts: SimilarityResults) => {
    cy.get(`#${hsk1Node1}`).should('exist');
};

function compareSimilarity(knownDocumentName:string, unknownDocumentName: string) {
    const map = {
        testFrequencyDocument1: 'test-freq1.txt',
        testFrequencyDocument2: 'test-freq2.txt',
        hsk1: 'hsk1.txt'
    }
    cy.fixture( `reading-documents/${map[knownDocumentName]}`, 'utf-8' )
        .then(fileText => TabulateChineseText(fileText))
}

describe('Shows progress on frequency documents', () => {
    beforeEach(() => {
        cy.visitHome();
        cy.clearIndexedDB();
    })
    it('Opens the default graph', () => {
        DirectoryPom.goToGraph();
        assertLabelAndCount(hsk1, compareSimilarity(hsk1, hsk1) );
        assertLabelAndCount(testFrequencyDocument1, compareSimilarity(hsk1, testFrequencyDocument1) )
        assertLabelAndCount(testFrequencyDocument2, compareSimilarity(hsk1, testFrequencyDocument2) )
    });
    it('Allows the user to click a node and then see the tree from that node\s perspective', () => {
        DirectoryPom.goToGraph();
        cy.get(`#${testNode1}`).click();
        assertLabelAndCount(testFrequencyDocument1, compareSimilarity(testFrequencyDocument1, testFrequencyDocument1))
        assertLabelAndCount(hsk1, compareSimilarity(testFrequencyDocument1, hsk1))
        assertLabelAndCount(testFrequencyDocument2, compareSimilarity(testFrequencyDocument1, testFrequencyDocument2))
    });
})
