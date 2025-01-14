import { VideoMetadataEntity } from "../entities/video-metadata.entity";
import { DocumentView } from "../entities/document-view.entity";
import { VideoMetadataView } from "../entities/video-metadata-view.entity";
import { Subject } from "rxjs";

export class ObservableService {
    videoMetadataEvents$ = new Subject<VideoMetadataView>()
    documentEvents$ = new Subject<DocumentView>()
    constructor() {}
}
