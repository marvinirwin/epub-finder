import {OnModuleInit} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DocumentView} from "../../entities/document-view.entity";
import {Repository} from "typeorm";
import {Document} from "../../entities/document.entity";
import {promises as fs} from "fs";
import {join, parse} from "path";
import {BuiltInDocument} from "./built-in-document";

export class BuiltInDocumentsService implements OnModuleInit {

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
        const builtInDocumentPaths = (await readPathsInDir(`${ process.env.DOCUMENTS_DIR }/built-in`))
            .map(filePath => new BuiltInDocument({
                filePath,
                global: true,
                for_testing: false
            }));
        const testDocumentPaths = (await readPathsInDir(`${ process.env.DOCUMENTS_DIR }/test`))
            .map(filePath => new BuiltInDocument({
                filePath,
                global: false,
                for_testing: true
            }));
        const frequencyDocumentPaths = (await readPathsInDir(`${ process.env.DOCUMENTS_DIR }/frequency`))
            .map(filePath => new BuiltInDocument({
                filePath,
                global: false,
                for_frequency: true
            }));
        [
            ...builtInDocumentPaths,
            ...testDocumentPaths,
            ...frequencyDocumentPaths
        ].map(document => document.upsert({
            documentRepository: this.documentRepository,
            documentViewRepository: this.documentViewRepository
        }));
    }
}
const readPathsInDir = async (dir: string): Promise<string[]>  => {
    try {
        return (await fs.readdir(dir)).map(filename => join(dir, filename));
    } catch(e){
        return [];
    }
};

