import {ReplaySubject} from "rxjs";
import {ImageSearchRequest} from "../../../server/src/shared/IImageRequest";

export class ImageSearchService {
    public queryImageRequest$: ReplaySubject<ImageSearchRequest | undefined> = new ReplaySubject<ImageSearchRequest | undefined>(1);

}