export {VideoMetadata} from 'src/components/pronunciation-video/video-meta-data.interface'


export class BasicDocument {
    constructor(
        public name: string,
        public html: string,
    ) {
    }
}