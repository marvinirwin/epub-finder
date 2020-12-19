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

export class DocumentsService {
    constructor(
        @InjectRepository(DocumentView)
        private documentViewRepository: Repository<DocumentView>,
        @InjectRepository(Document)
        private documentRepository: Repository<Document>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) {
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

    public async saveDocumentForUser(
        user: User,
        documentToBeSavedDto: DocumentToBeSavedDto): Promise<Document> {
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