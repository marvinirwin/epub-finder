import { XMLDocumentNode } from "../../XMLDocumentNode";

export class Segment {
    _translation: string | undefined
    translatableText: string
    popperElement: XMLDocumentNode
    translated = false
    element: XMLDocumentNode
    translationCb: (s: string) => void | undefined
    documentId: string;
    textContent: string;

    constructor(element: XMLDocumentNode) {
        this.element = element;
        this.documentId = this.element.getAttribute("documentId");
        this.translatableText = this.element.textContent || "";
        this.textContent = this.translatableText;
    }

    getSentenceHTMLElement(): HTMLElement {
        // @ts-ignore
        return this.element;
    }

    async getTranslation(): Promise<string> {
        if (this.translated) {
            return this._translation;
        } else {
            this.translated = true;
            return this.translatableText;
        }
    }

    destroy() {
        this.element.parentNode.removeChild(this.element);
        this.popperElement.parentNode.removeChild(this.popperElement);
    }

    get children(): XMLDocumentNode[] {
        return Array.from(this.element.childNodes);
    }
}
