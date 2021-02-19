import {OnModuleInit} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DocumentView} from "../../entities/document-view.entity";
import {Repository} from "typeorm";
import {Document} from "../../entities/document.entity";
import {promises as fs} from "fs";
import {join} from "path";
import {BuiltInDocument} from "./built-in-document";

export class UploadOnStartupService implements OnModuleInit {

    constructor(
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        @InjectRepository(DocumentView)
        private documentViewRepository: Repository<DocumentView>,
    ) {
    }

    async onModuleInit() {
        // TODO make this work with S3
        this.insertDocumentsInDocumentsDir();
    }

    private async insertDocumentsInDocumentsDir() {
        const getBuiltInDocumentsInPath = (dir, props) => readPathsInDir(dir)
            .then(paths => paths.map(filePath => new BuiltInDocument({
                filePath,
                ...props,
            })))

        const builtInReadingDocuments = await getBuiltInDocumentsInPath(
            process.env.READING_DOCUMENTS_DIR,
            {
                global: true}
        )
        const testReadingDocumentPaths = await getBuiltInDocumentsInPath(
            process.env.TEST_READING_DOCUMENTS_DIR,
            {for_testing: true}
        );
        const frequencyDocumentPaths = await getBuiltInDocumentsInPath(
            process.env.FREQUENCY_DOCUMENTS_DIR,
            {for_frequency: true}
        );
        const testFrequencyDocumentPaths = await getBuiltInDocumentsInPath(
            process.env.TEST_FREQUENCY_DOCUMENTS_DIR,
            {
                for_frequency: true,
                for_testing: true
            }
        );

        [
            ...builtInReadingDocuments,
            ...testReadingDocumentPaths,
            ...frequencyDocumentPaths,
            ...testFrequencyDocumentPaths
        ].map(document => document.upsert({
            documentRepository: this.documentRepository,
            documentViewRepository: this.documentViewRepository
        }));
    }
}

const readPathsInDir = async (dir: string): Promise<string[]> => {
    try {
        return (await fs.readdir(dir)).map(filename => join(dir, filename));
    } catch (e) {
        return [];
    }
};

