import {sleep} from "../Util/Util";
import {Observable, ReplaySubject} from "rxjs";
import {shareReplay, switchMap} from "rxjs/operators";
import $ from "jquery";

export type IFrameReturnValue = { iframe: HTMLIFrameElement; body: HTMLBodyElement };

export class Frame {
    public static async SetIFrameSource(iframe: HTMLIFrameElement, src: string) {
        iframe.srcdoc = src;
        await sleep(500);
    }

    iframeContainerRef$ = new ReplaySubject<HTMLElement>(1);
    iframe$: Observable<HTMLIFrameElement>;

    constructor() {
        this.iframe$ = this.iframeContainerRef$.pipe(
            switchMap(async containerRef => {
                return await this.createIFrame(containerRef);
            }),
            shareReplay(1)
        )
    }

    async createIFrame(ref: HTMLElement): Promise<HTMLIFrameElement> {
        for (let i = 0; i < ref.children.length; i++) {
            ref.children[i].remove();
        }
        const iframe = $(` <iframe style="border: none; width: 100%; height: 100%; font-family: sans-serif"> </iframe>`)[0];
        ref.appendChild(iframe);
        return iframe as HTMLIFrameElement;
    }
}