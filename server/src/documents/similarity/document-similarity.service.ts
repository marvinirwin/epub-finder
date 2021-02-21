import {InjectRepository} from "@nestjs/typeorm";
import {SimilarityEdge} from "../../entities/count-edge.entity";
import {Repository} from "typeorm";
import {SimilarityEdgeVersion} from "../../entities/count-edge.version.entity";
import {Inject} from "@nestjs/common";
import {TabulateService} from "./tabulate.service";

export class DocumentSimilarityService {
    constructor(
        @InjectRepository(SimilarityEdge)
        private similarityEdgeRepository: Repository<SimilarityEdge>,
        @InjectRepository(SimilarityEdgeVersion)
        private similarityEdgeVersionRepository: Repository<SimilarityEdgeVersion>,
        @Inject(TabulateService)
        private tabulateService: TabulateService
    ) {
    }

    async compareDocumentsByName(knownDocumentName: string, unknownDocumentName: string, words: string[]) {
        const knownSerializedTabulation = await this.tabulateService.tabulate(
            {where: {name: knownDocumentName}},
            words
        );

    }
}