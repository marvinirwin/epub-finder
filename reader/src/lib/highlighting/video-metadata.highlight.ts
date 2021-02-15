import {HighlighterService} from "./highlighter.service";
import {VideoMetadataService} from "../../../../server/src/video_metadata/video-metadata.service";
import {VideoMetadataRepository} from "../../services/video-metadata.repository";
import {Modes, ModesService} from "../modes/modes.service";
import {combineLatest} from "rxjs";
import {map} from "rxjs/operators";
import {RGBA} from "./color.service";
import CardsRepository from "../manager/cards.repository";

export class VideoMetadataHighlight {
    constructor(
        {
            highlighterService,
            videoMetadataRepository,
            modesService,
        }:
            {
                highlighterService: HighlighterService,
                videoMetadataRepository: VideoMetadataRepository,
                modesService: ModesService,
            }
    ) {
        const rgba: RGBA = [0, 160, 0, 0.5];
        highlighterService.singleHighlight(
            combineLatest([
                modesService.mode$,
                videoMetadataRepository.all$
            ]).pipe(
                map(([mode, metadataMap]) => {
                   if (mode !== Modes.VIDEO) {
                       return [];
                   }
                   return [...metadataMap.keys()]
                }),
                map(HighlighterService.wordsToMap(rgba))
            ),
            [0, 'HAS_VIDEO_METADATA']
        )

    }
}