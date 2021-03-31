import { PAGES, READING_NODE } from '@shared/*'
import { DirectoryPom } from '../../support/pom/directory.pom'
import { ReadingPom } from '../../support/pom/reading.pom'
import { TestDocumentsPom } from './test-documents.pom'

describe('Choose a default document when there is non selected', () => {
    it('picks the first document if none is selected', () => {
        DirectoryPom.visitPage(READING_NODE)
        ReadingPom.TextIncludes(TestDocumentsPom.defaultDocument.firstLine)
    })
})
