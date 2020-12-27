import {OnModuleInit} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DocumentView} from "../entities/document-view.entity";
import {Repository} from "typeorm";
import {Document} from "../entities/document.entity";
import {User} from "../entities/user.entity";
import fs from "fs-extra";
import {join, parse} from "path";
import {sha1} from "../util/sha1";
import {startCase} from "lodash";

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
        // this.insertDocumentsInDocumentsDir();
    }

    private async insertDocumentsInDocumentsDir() {
        // Get all the documents, get their hashes, compare with the current documents
        const documents = await Promise.all(
            (await fs.readdir(process.env.BUILT_IN_DOCUMENTS_DIR))
                .filter(filename => filename.endsWith('.html'))
                .map(filename =>
                    fs.readFile(join(process.env.BUILT_IN_DOCUMENTS_DIR, filename))
                        .then(content => ({filename, html: content.toString()}))// Do I have to add UTF-8 here?
                )
        );
        for (let i = 0; i < documents.length; i++) {
            const {filename, html} = documents[i];
            const htmlHash = sha1(html);
            const name = startCase(parse(filename).name);
            const sameVersion = await this.documentViewRepository.findOne({
                hash: htmlHash,
                name
            })
            const baseEntity: Partial<Document> = {
                name,
                hash: htmlHash,
                global: true,
                html,
                creator_id: undefined
            };
            if (!sameVersion) {
                const differentVersion = await this
                    .documentViewRepository
                    .findOne({name, creator_id: null});

                if (differentVersion) {
                    console.log(`Hash is different, updating ${differentVersion.name}`);
                    await this.documentRepository.insert({
                        ...baseEntity, document_id: differentVersion.rootId()
                    });
                } else {
                    console.log(`Inserting ${name} for the first time`);
                    await this.documentRepository.insert(baseEntity)
                }
            } else {
                console.log(`${name} already exists`)
            }
        }
    }
}