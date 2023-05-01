import { ReplaySubject } from 'rxjs'
import { ProgressItemService } from './progress-item.service'

export class ProgressItem {
    public text$ = new ReplaySubject<string>(1)

    constructor(private progressItemService: ProgressItemService) {}

    text(text: string) {
        this.text$.next(text)
        return this
    }

    start() {
        this.progressItemService.progressItems$.next(
            new Set(this.progressItemService.progressItems$.getValue()).add(
                this,
            ),
        )
    }

    stop() {
        const newSet = new Set(
            this.progressItemService.progressItems$.getValue(),
        )
        newSet.delete(this)
        this.progressItemService.progressItems$.next(newSet)
    }

    async exec(cb: () => Promise<any> | any) {
        try {
            debugger;
            this.start()
            await cb()
            debugger;
            this.stop()
        } catch (e) {
            debugger;
            this.stop()
            throw e
        }
    }
}
