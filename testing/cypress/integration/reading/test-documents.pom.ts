export interface TestDocument {
    name: string;
    textContent: string;
}
export class TestDocumentsPom {
    public static defaultDocument: TestDocument = {
        name: 'test_txt',
        textContent: '今天'
    }
}