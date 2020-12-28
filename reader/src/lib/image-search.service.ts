import {ReplaySubject} from "rxjs";
import {ImageSearchRequest} from "./Interfaces/IImageRequest";

export class ImageSearchService {
    public queryImageRequest$: ReplaySubject<ImageSearchRequest | undefined> = new ReplaySubject<ImageSearchRequest | undefined>(1);

}