import {InjectRepository} from "@nestjs/typeorm";
import {SimilarityEdge} from "../../entities/count-edge.entity";
import {Repository} from "typeorm";
import {SimilarityEdgeVersion} from "../../entities/count-edge.version.entity";
import {Inject} from "@nestjs/common";
import {TabulateService} from "./tabulate.service";
import {CacheService} from "../../util/cache.service";
import {SimilarityResults} from "../../shared/compre-similarity-result";
import {computeSimilarityTabulation} from "../../shared/similarity-result.interface";

export class DocumentSimilarityService {
    constructor(
        @InjectRepository(SimilarityEdge)
        private similarityEdgeRepository: Repository<SimilarityEdge>,
        @InjectRepository(SimilarityEdgeVersion)
        private similarityEdgeVersionRepository: Repository<SimilarityEdgeVersion>,
        @Inject(TabulateService)
        private tabulateService: TabulateService,
        @Inject(CacheService)
        private cacheService: CacheService
    ) {
    }

    async compareDocumentsByName(knownDocumentName: string, unknownDocumentName: string, words: string[]): Promise<SimilarityResults> {
        return this.cacheService.memo<SimilarityResults>(
            {
                args: [knownDocumentName, unknownDocumentName, words],
                service: "DocumentSimilarityService",
                cb: async () => {
                    const knownSerializedTabulation = await this.tabulateService.tabulate(
                        {where: {name: knownDocumentName}},
                        words
                    );
                    const unknownSerializedTabulation = await this.tabulateService.tabulate(
                        {where: {name: knownDocumentName}},
                        words
                    );
                    return computeSimilarityTabulation(
                        knownSerializedTabulation,
                        unknownSerializedTabulation
                    )
                }
            }
        )

    }
}