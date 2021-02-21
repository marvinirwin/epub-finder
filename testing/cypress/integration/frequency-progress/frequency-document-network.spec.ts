import {hsk1Node, QUIZ_BUTTON_EASY, testNode1, testNode2} from "@shared/*";
import {DirectoryPom} from "../../support/pom/directory.pom";
import {QuizPom} from "../../support/pom/quiz.pom";
import {SimilarityResults} from "../../../../server/src/shared/compre-similarity-result";

const defaultTestFrequencyDocument = 'Default Test Frequency Document';
const testFrequencyDocument1 = 'Test Frequency Document 1';
const testNode1CountLabel = '';

const assertLabelAndCount = (hsk1Node1: string, counts: SimilarityResults) => {
    cy.get(`#${hsk1Node1}`).should('exist');
};

describe('Shows progress on frequency documents', () => {
    beforeEach(() => {
        cy.visitHome();
        cy.clearIndexedDB();
    })
    it('Opens the default graph', () => {
        DirectoryPom.goToGraph();
        assertLabelAndCount(hsk1Node, hsk1FromHsk1);
        assertLabelAndCount(testNode1, testNode1FromHsk1Counts)
        assertLabelAndCount(testNode2, testNode2FromHsk1Counts)
    });
    it('Allows the user to click a node and then see the tree from that node\s perspective', () => {
        DirectoryPom.goToGraph();
        cy.get(`#${testNode1}`).click();
        assertLabelAndCount(testNode1, testNode1FromTestNode1)
        assertLabelAndCount(testNode2, testNode2FromTestNode1)
        assertLabelAndCount(hsk1Node, hsk1FromTestNode2)
    });
})
