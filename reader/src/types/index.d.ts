export {VideoMetadata} from 'src/components/PronunciationVideo/video-meta-data.interface'


export class BasicDocument {
    constructor(
        public name: string,
        public html: string,
    ) {
    }
}