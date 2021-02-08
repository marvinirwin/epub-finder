export interface TestDocument {
    name: string;
    firstLine: string;
}
export class TestDocumentsPom {
    public static defaultDocument: TestDocument = {
        name: 'Test Txt',
        firstLine: '今天'
    }
    public static htmlDocument: TestDocument = {
        name: 'Test Html',
        firstLine: '你好'
    }
}