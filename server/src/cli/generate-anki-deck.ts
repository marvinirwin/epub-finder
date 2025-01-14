import commandLineArgs from "command-line-args";
import {CardView} from "../entities/card-view.entity";
import {Repository} from "typeorm";
import {CustomWord} from "../entities/custom-word.entity";
import {DocumentView} from "../entities/document-view.entity";
import fs from "fs-extra";
import {parseCedictDictionary} from "../shared";
import {s3ReadStream} from "../documents/uploading/s3.service";
import {streamToString} from "../documents/similarity/tabulate.service";

async function getDocuments({documentNames, documentRepository, languageCode, userId}: {
    documentNames: string[];
    documentRepository: Repository<DocumentView>;
    languageCode: string;
    userId: number;
}) {
    const documents = await Promise.all(documentNames.map(documentName => documentRepository.findOne({
        name: documentName,
        creator_id: userId,
        language_code: languageCode
    })));
    const missingDocuments = documents.filter(document => !document);
    if (missingDocuments.length) {
        // TODO make this error message better by showing the specific documents which weren't found
        throw new Error(`Cannot find all documents ${documentNames.join(", ")}`);
    }
}

async function getFlashCards({
                                 cardRepository,
                                 languageCode,
                                 userId
                             }: { languageCode: string; userId: number; cardRepository: Repository<CardView> }) {
    return cardRepository.find({creator_id: userId, language_code: languageCode});
}

async function getCustomWords({
                                  customWordRepository,
                                  languageCode,
                                  userId
                              }: { languageCode: string; userId: number; customWordRepository: Repository<CustomWord> }) {
    return customWordRepository.find({language_code: languageCode, creator_id: userId});
}

async function resolveBuiltInWords({languageCode, cedictPath}: { languageCode: string; cedictPath: string }) {
    const fileContents = await fs.readFile(cedictPath);
    return parseCedictDictionary(fileContents.toString("utf8"));
}

async function getExampleSegmentMap({
                                        exampleDocuments,
                                        words,
                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                        languageCode
                                    }: {
    exampleDocuments: DocumentView[];
    words: Set<string>;
    languageCode: string;
}) {
    // TODO extract functionality from the atomize things
    const atomizeDocument = async (document: DocumentView) => {
        // Fetch the document from S3 and then atomize it
        const text = streamToString(
            await s3ReadStream(document.filename),
        );
    };
}

export const generateAnkiDeck = async (
    {
        customArgv,
        cardRepository,
        customWordRepository,
        documentRepository,
    }:
        {
            customArgv: string[];
            cardRepository: Repository<CardView>;
            customWordRepository: Repository<CustomWord>;
            documentRepository: Repository<DocumentView>;
        }) => {
    const args = commandLineArgs(
        {
            language_code: {
                type: String,
            },
            user_id: {
                type: Number,
            },
            example_documents: {
                type: String,
                multiple: true,
            },
            frequency_documents: {
                type: String,
                multiple: true,
            },
            package_name: {
                type: String,
                required: true
            }
        },
        {
            argv: customArgv || process.argv,
        },
    );
/*
    const exampleDocuments = await getDocuments({userId, documentNames, languageCode, documentRepository});
    const frequencyDocuments = await getDocuments({userId, documentNames, languageCode, documentRepository});
    const flashCards = await getFlashCards({userId, languageCode, cardRepository});
    const customWords = await getCustomWords({languageCode, userId, customWordRepository});
    const builtInWords = await resolveBuiltInWords({languageCode});
    const exampleSegmentMap = await getExampleSegmentMap(exampleDocuments);
    const allWords = await getAllWords({exampleSegmentsMap, customWords, builtInWords});
    const orderedWords = await getOrderedWords({exampleSegmentsMap, allWords});
    await writeZipFile({orderedWords, flashCards});
*/
};