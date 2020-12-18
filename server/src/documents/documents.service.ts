import fs from 'fs-extra';
import {startCase} from 'lodash';
import {User} from "../entities/user.entity";
import {Document} from "../entities/document.entity";
import {DocumentView} from "../entities/document-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {OnModuleInit} from "@nestjs/common";
import {join} from "path";
import {sha1} from "../util/sha1";
import {DocumentToBeSavedDto} from "./document-to-be-saved.dto";

function CannotFindDocumentForUser(documentIdToDelete: string, user: User) {
    return new Error(`Cannot find existing document with id ${documentIdToDelete} which belongs to user ${user.id}`);
}

export class DocumentsService implements OnModuleInit {
    constructor(
        @InjectRepository(DocumentView)
        private documentViewRepository: Repository<DocumentView>,
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
    }

    async onModuleInit() {
        this.insertDocumentsInDocumentsDir();
    }

    private async insertDocumentsInDocumentsDir() {
        // Get all the documents, get their hashes, compare with the current documents
        const documents = await Promise.all(
            (await fs.readdir(process.env.BUILT_IN_DOCUMENTS_DIR))
                .filter(filename => filename.endsWith('.html'))
                .map(filename => fs.readFile(join(process.env.BUILT_IN_DOCUMENTS_DIR, filename))
                    .then(content => ({filename, html: content.toString()}))// Do I have to add UTF-8 here?
                )
        );
        for (let i = 0; i < documents.length; i++) {
            const {filename, html} = documents[i];
            const htmlHash = sha1(html);
            const name = startCase(filename);
            const sameVersion = await this.documentRepository.findOne({html_hash: htmlHash, name})
            const baseEntity = {
                name,
                html_hash: htmlHash,
                global: true,
                html,
                creator_id: undefined
            };
            if (!sameVersion) {
                const differentVersion = await this.documentRepository.findOne({name, creator_id: null})
                if (differentVersion) {
                    console.log(`Hash is different, updating ${differentVersion}`);
                    await this.documentRepository.insert({...baseEntity, document_id: differentVersion.document_id});
                } else {
                    console.log(`Inserting ${name} for the first time`);
                    await this.documentRepository.insert(baseEntity)
                }
            } else {
                console.log(`${name} already exists`)
            }
        }
    }

    async queryAvailableDocuments(user?: User | undefined): Promise<DocumentView[]> {
        return await this.documentViewRepository
            .find({
                    where: [
                        {creator_id: user?.id},
                        {global: true}
                    ]
                }
            )
    }

    public async saveDocumentForUser(user: User, documentToBeSavedDto: DocumentToBeSavedDto): Promise<Document> {
        const savingRevisionOfAnotherdocument = !!documentToBeSavedDto.document_id;
        if (savingRevisionOfAnotherdocument) {
            if (!await this.documentBelongsToUser(user, documentToBeSavedDto.document_id)) {
                throw CannotFindDocumentForUser(documentToBeSavedDto.document_id, user);
            }
            await this.queryExistingDocumentForUser(user, documentToBeSavedDto.document_id);
        }
        return await this.documentRepository.save({
            ...documentToBeSavedDto,
            creator_id: user.id,
            global: false,
            html_hash: sha1(documentToBeSavedDto.html)
        })
    }

    /**
     * Returns an existing document by document_id belonging to a user
     * Or throws an error if it cannot find it
     * @param user
     * @param documentIdToDelete
     * @private
     */
    private async queryExistingDocumentForUser(user: User, documentIdToDelete: string) {
        const existingdocument = await this.queryDocumentForUser(user, documentIdToDelete);
        if (!existingdocument) {
            throw CannotFindDocumentForUser(documentIdToDelete, user)
        }
        return existingdocument;
    }

    private async queryDocumentForUser(user: User, documentIdToDelete: string) {
        return await this.documentRepository.find({
            creator_id: user.id,
            document_id: documentIdToDelete
        });
    }

    private async documentBelongsToUser(user, document_id) {
        return !!await this.queryDocumentForUser(user, document_id);
    }
}