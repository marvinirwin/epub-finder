import {User} from "../entities/user.entity";
import {Document, documentRootId} from "../entities/document.entity";
import {DocumentView} from "../entities/document-view.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {basename} from "path";
import {HashService} from "./uploading/hash.service";
import {HttpException} from "@nestjs/common";
import {DocumentUpdateDto} from "./document-update.dto";

function CannotFindDocumentForUser(documentIdToDelete: string, user: User) {
    return new Error(`Cannot find existing document with id ${documentIdToDelete} which belongs to user ${user.id}`);
}

export class DocumentsService {
    constructor(
        @InjectRepository(DocumentView)
        public documentViewRepository: Repository<DocumentView>,
        @InjectRepository(Document)
        public documentRepository: Repository<Document>,
        @InjectRepository(User)
        public userRepository: Repository<User>,
    ) {
    }

    async allDocuments({user, for_testing}:{user?: User | undefined, for_testing?: boolean}): Promise<DocumentView[]> {
        return await this.documentViewRepository
            .find({
                    where: [
                        {creator_id: user?.id, deleted: false, for_testing},
                        {global: true, deleted: false, for_testing},
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
            hash: await HashService.hashS3(filePath),
            creator_id: user.id,
            global: false
        })
    }

    public async saveNew(user: User, name: string, filePath: string) {

        return await this.documentRepository.save({
            name,
            filename: basename(filePath),
            hash: await HashService.hashS3(filePath),
            creator_id: user.id,
            global: false
        })
    }

    public async delete(user: User, documentId: string) {
        const existing = await this.existing(user, documentId);
        const deletingId = documentRootId(existing);
        delete existing.id;
        delete existing.created_at;
        return await this.documentRepository.save({
            ...existing,
            document_id: deletingId,
            deleted: true
        })
    }

    /**
     * Returns an existing document by document_id/id belonging to a user
     * Or throws an error if it cannot find it
     * @param user
     * @param documentIdToDelete
     * @private
     */
    private async existing(user: User, documentIdToDelete: string) {
        const existingDocument = await this.byDocumentId(user, documentIdToDelete);
        if (!existingDocument) {
            throw CannotFindDocumentForUser(documentIdToDelete, user)
        }
        return existingDocument;
    }

    private async byDocumentId(user: User, documentId: string) {
        return await this.documentViewRepository.findOne({
            where: [
                {
                    creator_id: user.id,
                    document_id: documentId
                },
                {
                    creator_id: user.id,
                    id: documentId
                }
            ]
        });
    }

    private async belongsToUser(user, document_id) {
        return !!await this.byDocumentId(user, document_id);
    }

    public async byFilename({filename, user}:{filename: string, user?: User}) {
        const whereConditions: Partial<DocumentView>[] = [
            {
                global: true,
                filename
            },
            {
                for_testing: true,
                filename
            },
            {
                for_frequency: true,
                filename
            },
            {
                for_reading: true,
                filename
            }
    ]
        if (user) {
            whereConditions.push(
                {
                    creator_id: user.id,
                    filename
                },
            )
        }
        return await this.documentViewRepository.findOne({
            where: whereConditions
        });
    }

    public async byName(name: string, user: User) {
        return await this.documentViewRepository.findOne({
            name,
            creator_id: user.id
        });
    }

    public async update(user: User, d: DocumentUpdateDto) {
        const currentEntry = await this.documentViewRepository.findOne(d.id);
        if (!currentEntry) {
            // TTODO what status is this?
            throw new HttpException(`Unknown document id ${d.id}`, 500);
        }
        if (currentEntry.creator_id !== user.id) {
            throw new HttpException(`Not authorized to modify id ${d.id}`, 401);
        }
        // Will this be mad because the id property will also be spread in?
        // Don't I have to use the document_id prop?
        return await this.documentRepository.insert({...currentEntry, ...d})
    }

}