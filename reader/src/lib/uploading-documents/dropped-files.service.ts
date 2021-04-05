import { ReplaySubject } from 'rxjs'

export class DroppedFilesService {
    public static extensionFromFilename(filename: string): string {
        return filename.split('.').reverse()[0] || ''
    }
}
