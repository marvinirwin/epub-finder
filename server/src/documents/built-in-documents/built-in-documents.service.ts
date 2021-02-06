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
        const builtInPaths = (await readPathsInDir(process.env.BUILT_IN_DOCUMENTS_DIR))
            .map(filePath => new BuiltInDocument({
                filePath,
                global: true,
                for_testing: false
            }));
        const testPaths = (await readPathsInDir(process.env.TEST_DOCUMENTS_DIR))
            .map(filePath => new BuiltInDocument({
                filePath,
                global: false,
                for_testing: true
            }));
        [
            ...builtInPaths,
            ...testPaths
        ].map(document => document.upsert({
            documentRepository: this.documentRepository,
            documentViewRepository: this.documentViewRepository
        }))
    }
}
const readPathsInDir = async (dir: string): Promise<string[]>  => {
    try {
        return (await fs.readdir(dir)).map(filename => join(dir, filename))
    } catch(e){
        return [];
    }
}

