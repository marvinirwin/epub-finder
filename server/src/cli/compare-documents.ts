import {ChineseVocabService} from "../shared/tabulate-documents/chinese-vocab.service";
import commandLineArgs from "command-line-args";
const compareDocuments = async (customArgv: string[]) => {
    const args = commandLineArgs(
        {
            language_code: {
                type: String,
            },
            documents: {
                type: String,
                multiple: true,
                defaultOption: true,
            },
        },
        {
            argv: customArgv || process.argv,
        },
    );
    const [doc1Name, doc2Name] = args.documents;
    console.log(
      //@ts-ignore
        await this.documentSimilarityService.compareDocumentsByName(
            doc1Name,
            doc2Name,
            await ChineseVocabService.vocab(),
            args.language_code,
        ),
    );
};
export default compareDocuments;