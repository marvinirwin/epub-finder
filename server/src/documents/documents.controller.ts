import { Response } from "express";
import { Document } from "../entities/document.entity";
import {
    Body,
    Controller,
    Get,
    Header,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { UserFromReq } from "../decorators/userFromReq";
import { User } from "../entities/user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { HashService } from "./uploading/hash.service";
import multerS3 from "multer-s3";
import { v4 as uuidv4 } from "uuid";
import { s3, s3ReadStream } from "./uploading/s3.service";
import { DocumentViewDto } from "./document-view.dto";
import { S3UploadedFile, UploadOutput } from "./uploading/s3-uploaded-file";
import { RevisionUpdater } from "../revision-updater";
import { DocumentUpdateDto } from "./document-update.dto";
import { ltDocId } from "../shared/lt-document";
import { LoggedInGuard } from "../guards/logged-in.guard";
import {TranslateWithGrammarExplanationDto} from "../shared";
import {SplitWordsDto} from "../shared";

@Controller("/api/documents")
export class DocumentsController {
    constructor(
        private documentsService: DocumentsService,
        private uploadedFileService: HashService,
    ) {
    }

    @Get("")
    async all(
        @UserFromReq() user: User | undefined,
        @Headers("is_test") is_test: string,
        @Query("language_code") language_code: string,
    ) {
        return this.documentsService.allDocuments({
            user,
            condition: {
                for_testing: !!is_test,
                language_code,
            },
        });
    }

    @Put("")
    @UseGuards(LoggedInGuard)
    @UseInterceptors(
        FileInterceptor("file", {
            storage: multerS3({
                s3: s3,
                bucket: "languagetrainer-documents",
                acl: "public-read",
                metadata: (req, file, cb) => {
                    return cb(null, { fieldName: file.fieldname });
                },
                key: (req, file, cb) => {
                    return cb(null, uuidv4());
                },
            }),
            limits: {
                files: 1,
                fields: 1,
                fileSize: 1024 * 1024 * 10, // 10MB file size
            },
        }),
    )
    async upload(
        @UploadedFile()
            file: {
            originalname: string;
            bucket: string;
            key: string;
            location: string;
        },
        @UserFromReq() user: User,
        @Headers("document_id") document_id: string | undefined,
        @Headers("language_code") language_code: string,
        @Headers("sandbox_file") sandbox_file: string | undefined,
        @Headers("for_frequency") for_frequency: string | undefined,
        @Headers("for_reading") for_reading: string | undefined,
    ): Promise<DocumentViewDto> {
        const output: UploadOutput = await new S3UploadedFile(
            file,
            !!sandbox_file,
        ).output();
        const name = file.originalname.split(".").slice(0, -1).join("");
        const documentUpdateDto = {
            for_frequency: !!for_frequency,
            name,
            for_reading: !!for_reading,
            global: false,
            deleted: false,
            language_code,
            id: undefined,
            hash: await HashService.hashS3(output.index().s3Key),
            filename: output.index().s3Key,
            document_id,
        };
        const submitter = this.getRevisionUpdater(user, document_id);
        // Check if we're allowed to modify this file
        return await submitter.SubmitRevision(documentUpdateDto);
        /*
                return await this.documentsService.byFilename({
                    filename: savedDocument.filename,
                    user,
                })
        */
    }

    @Get(":filename")
    @HttpCode(HttpStatus.OK)
    @Header("Content-Type", "text/html")
    file(
        @UserFromReq() user: User | undefined,
        @Param("filename") filename: string,
        @Res() response: Response,
    ) {
        return new Promise<void>(async (resolve, reject) => {
            const doc = await this.documentsService.byFilename({
                filename,
                user,
            });
            if (!doc) {
                return reject(
                    new HttpException(
                        `Cannot find document ${filename} for user ${user?.id}`,
                        404,
                    ),
                );
            }
            (await s3ReadStream(filename)).pipe(response);
            resolve();
        });
    }

    @Post("update")
    async update(
        @Body() documentUpdateDto: DocumentUpdateDto,
        @UserFromReq() user: User | undefined,
    ) {
        if (!user) {
            throw new HttpException("Not authorized to update document", 401);
        }
        const submitter = this.getRevisionUpdater(user, ltDocId(documentUpdateDto));
        // Check if we're allowed to modify this file
        return await submitter.SubmitRevision(documentUpdateDto);
        /*
        return this.documentsService.update(
            user,
            {
                for_frequency: documentUpdateDto.for_frequency,
                name: documentUpdateDto.name,
                for_reading: documentUpdateDto.for_reading,
                global: documentUpdateDto.global,
                id: documentUpdateDto.id,
                deleted: documentUpdateDto.deleted
            }
        )
*/
    }

    @Post('splitWords')
    @UseGuards(LoggedInGuard)
    async splitWords(
        @Body() segmentDto: SplitWordsDto,
    ) {
        return this.documentsService.splitWords(segmentDto)
    }

    @Post('translationWithGrammarHints')
    @UseGuards(LoggedInGuard)
    async translationWithGrammarHints(
        @Body() segmentDto: TranslateWithGrammarExplanationDto,
    ) {
        return this.documentsService.translationWithGrammarHints(segmentDto)
    }

    private getRevisionUpdater(user: User, existingDocumentId: string) {
        return new RevisionUpdater<Document, DocumentUpdateDto>(
            (r) => {
                if (r.id) {
                    return this.documentsService.documentRepository.findOne({ id: r.id });
                }
            },
            (documentView) => documentView.creator_id === user?.id,
            (currentVersion, newVersion) => ({
                ...currentVersion,
                document_id: existingDocumentId,
                for_frequency: newVersion.for_frequency,
                for_reading: newVersion.for_reading,
                global: newVersion.global,
                name: newVersion.name,
                deleted: newVersion.deleted,
                id: undefined,
                created_at: undefined,
            }),
            (newVersion) =>
                this.documentsService.documentRepository.save(newVersion),
            (newVersion) => ({
                ...newVersion,
                creator_id: user?.id,
            }),
        );
    }

}
