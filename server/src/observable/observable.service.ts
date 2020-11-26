import {VideoMetadataEntity} from "../entities/video.metadata";
import {BookViewEntity} from "../entities/book-view.entity";
import {VideoMetadataViewEntity} from "../entities/video-metadata-view.entity";
import {Subject} from "rxjs";

export class ObservableService {
    videoMetadataEvents$ = new Subject<VideoMetadataViewEntity>()
    bookEvents$ = new Subject<BookViewEntity>();
    constructor() {
    }
}