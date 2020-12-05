import {VideoMetadata} from "../entities/video.metadata";
import {BookView} from "../entities/book-view.entity";
import {VideoMetadataView} from "../entities/video-metadata-view.entity";
import {Subject} from "rxjs";

export class ObservableService {
    videoMetadataEvents$ = new Subject<VideoMetadataView>()
    bookEvents$ = new Subject<BookView>();
    constructor() {
    }
}