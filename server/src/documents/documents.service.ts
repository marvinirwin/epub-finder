import {User} from "../entities/user.entity";
import {Document} from "../entities/document.entity";
import {DocumentView} from "../entities/document-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {basename, join} from "path";
import {UploadedFileService} from "./uploaded-file.service";

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

    async all(user?: User | undefined): Promise<DocumentView[]> {
        return await this.documentViewRepository
            .find({
                    where: [
                        {creator_id: user?.id},
                        {global: true}
                    ]
                }
            )
    }

    public async saveRevision(user: User, name: string, filePath: string, documentId: string) {
        if (!await this.belongsToUser(user, documentId)) {
            throw CannotFindDocumentForUser(documentId, user);
        }
        return await this.documentRepository.save({
            document_id: documentId,
            name,
            filename: basename(filePath),
            hash: await UploadedFileService.fileHash(filePath),
            creator_id: user.id,
            global: false
        })
    }

    public async saveNew(user: User, name: string, filePath: string) {
        return await this.documentRepository.save({
            name,
            filename: basename(filePath),
            hash: await UploadedFileService.fileHash(filePath),
            creator_id: user.id,
            global: false
        })
    }

    public async delete(user: User, documentId: string) {
        const existing = await this.existing(user, documentId);
        delete existing.id;
        return await this.documentRepository.save({
            ...existing,
            deleted: true
        })
    }

    /**
     * Returns an existing document by document_id belonging to a user
     * Or throws an error if it cannot find it
     * @param user
     * @param documentIdToDelete
     * @private
     */
    private async existing(user: User, documentIdToDelete: string) {
        const existingDocument = await this.byId(user, documentIdToDelete);
        if (!existingDocument) {
            throw CannotFindDocumentForUser(documentIdToDelete, user)
        }
        return existingDocument;
    }

    private async byId(user: User, documentId: string) {
        return await this.documentViewRepository.findOne({
            creator_id: user.id,
            document_id: documentId
        });
    }

    private async belongsToUser(user, document_id) {
        return !!await this.byId(user, document_id);
    }
}