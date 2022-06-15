import {getIndexOfEl} from "../getIndexOfEl";
import {DOMParser, XMLSerializer} from "xmldom";
import {Segment} from "./segment/segment";
import {XMLDocumentNode} from "../XMLDocumentNode";
import {annotatedAndTranslated} from "../selectors";
import {InterpolateService} from "../interpolate.service";
import {segmentBoundaryRegexp} from "../tabulation/word-separator";
import {DocumentId} from "../sourced-text";

type atomizeConfiguration = {
    splitDelims?: string[];
}

export class AtomizedDocument {
    document: XMLDocument
    _originalSrc: string

    constructor(
        document: XMLDocument,
    ) {
        this._originalSrc = new XMLSerializer().serializeToString(document);
        this.document = document;
    }

    static getPopperId(popperId: string) {
        return `translate-popper_${popperId}`;
    }

    static atomizeDocument(
        {
            documentSrc,
            documentId,
        }: {
            documentSrc: string;
            documentId: DocumentId;
        }
    ): AtomizedDocument {
        const doc = new AtomizedDocument(
            AtomizedDocument.getDomParser().parseFromString(
                documentSrc,
                "text/html",
            ),
        );
        doc.createMarksUnderLeaves(doc.getTextElements(doc.document));
        return doc;
    }

    static find(
        document: XMLDocument,
        cb: (n: Node) => boolean,
    ): Node | undefined {
        function walk(node: Node, cb: (n: Node) => any): Node | undefined {
            if (cb(node)) {
                return node;
            }
            let child, next;
            const TEXT_NODE = 3;
            const ELEMENT_NODE = 1;
            const DOCUMENT_NODE = 9;
            switch (node.nodeType) {
                case TEXT_NODE: // Text node
                    break;
                case ELEMENT_NODE: // Element node
                    // @ts-ignore
                    if (node.localName === "script") break;
                    // @ts-ignore
                    if (node.localName === "style") break;
                case DOCUMENT_NODE: // Document node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        const foundNode = walk(child, cb);
                        if (foundNode) {
                            return foundNode;
                        }
                        child = next;
                    }
                    break;
            }
        }

        return walk(document, (n) => {
            return cb(n);
        });
    }

    static fromAtomizedString(atomizedString: string) {
        try {
            return new AtomizedDocument(
                AtomizedDocument.getDomParser().parseFromString(atomizedString),
            );
        } catch (e) {
            return ERROR_DOCUMENT;
        }
    }

    static getDomParser() {
        return new DOMParser({
            errorHandler: {
                warning: () => {
                },
                error: () => {
                },
                fatalError: (w: Error) => {
                    throw w;
                },
            },
        });
    }

    static replaceHrefOrSource(el: Element, qualifiedName: string) {
        const currentSource = el.getAttribute(qualifiedName);
        if (currentSource && !currentSource.startsWith("data")) {
            el.setAttribute(
                qualifiedName,
                `${process.env.PUBLIC_URL}/${currentSource}`,
            );
        }
    }

    getTextElements(doc: Document) {
        const leaves: Element[] = [];

        function walk(node: Node, cb: (n: Node) => any) {
            let child, next;
            switch (node.nodeType) {
                case 3: // Text node
                    cb(node);
                    break;
                case 1: // Element node
                    // @ts-ignore
                    if (node.localName === "script") break;
                    // @ts-ignore
                    if (node.localName === "style") break;
                case 9: // Document node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        walk(child, cb);
                        child = next;
                    }
                    break;
            }
        }

        walk(doc, (node: Node) => {
            const text = (node.textContent as string).trim();
            if (text) {
                // @ts-ignore
                leaves.push(node);
            }
        });
        return leaves;
    }

    convertTextNodeToAtomizedSegments(textNode: Element): XMLDocumentNode {
        const text = textNode.nodeValue as string;
        const subSegmentTextList = text
            .split(segmentBoundaryRegexp)
            .filter((t) => !!t.trim())
            .reverse();
        const newParent = this.document.createElement("div");
        newParent.setAttribute("style", "display: block;");
        for (let i = 0; i < subSegmentTextList.length; i++) {
            const subSegmentTextListElement = subSegmentTextList[i];
            const elementWithMarksUnderIt = this.replaceTextNodeWithSubTextNode(
                textNode,
                subSegmentTextListElement.normalize().trim().split(""),
                "mark",
            );
            elementWithMarksUnderIt.setAttribute(
                "class",
                annotatedAndTranslated,
            );
        }

        // @ts-ignore
        return newParent;
    }

    replaceTextNodeWithSubTextNode(
        textNode: Element,
        newSubStrings: string[],
        newTagType: string,
    ) {
        const indexOfMe = getIndexOfEl(textNode);
        // If we remove ourselves and we're not already there, I think things go weird
        if (Array.from((textNode.parentNode as ParentNode).childNodes).includes(textNode)) {
            (textNode.parentNode as ParentNode).removeChild(textNode);
        }
        const newParent = this.document.createElement("span");
        newSubStrings.forEach((string, index) => {
            // I'll probably need to do labelling later so the data can be rehydrated
            // Perhaps this is inefficient, but for character based stuff its probably fine
            const mark = this.document.createElement(newTagType);
            const textNode = this.document.createTextNode(string);
            mark.setAttribute("nodeindex", `${index}`);
            mark.insertBefore(textNode, null);
            newParent.insertBefore(mark, null);
        });
        const oldParent = textNode.parentNode as ParentNode;
        oldParent.insertBefore(
            newParent,
            // @ts-ignore
            oldParent.childNodes.length ? oldParent.childNodes[indexOfMe] : null,
        );
        return newParent;
    }

    replaceDocumentSources(doc: Document) {
        const walk = (node: Node) => {
            let child, next;
            switch (node.nodeType) {
                case 1: // Element node
                    const el = node;
                    // @ts-ignore
                    AtomizedDocument.replaceHrefOrSource(el, "src");
                    // @ts-ignore
                    if (el.localName === "link") {
                        // @ts-ignore
                        AtomizedDocument.replaceHrefOrSource(el, "href");
                    }
                case 9: // Document node
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        walk(child);
                        child = next;
                    }
                    break;
            }
        };
        walk(doc);
        return doc;
    }

    createMarksUnderLeaves(textNodes: Element[]) {
        for (let i = 0; i < textNodes.length; i++) {
            this.convertTextNodeToAtomizedSegments(textNodes[i]);
        }
    }

    segments(): Segment[] {
        try {
            let segmentElements: XMLDocumentNode[] = [];
            if (this.document.getElementsByClassName) {
                // @ts-ignore
                segmentElements = this.document.getElementsByClassName(
                  annotatedAndTranslated,
                );
            } else {
                const walk = (node: Node) => {
                    let child, next;
                    // @ts-ignore
                    const attributes = node?.attributes;
                    const className = attributes?.getNamedItem("class");
                    if (className?.value?.includes(annotatedAndTranslated)) {
                        // @ts-ignore
                        segmentElements.push(node);
                    }
                    child = node.firstChild;
                    while (child) {
                        next = child.nextSibling;
                        walk(child);
                        child = next;
                    }
                };
                walk(this.document);
            }


            const atomized = new Array(segmentElements.length);
            for (let i = 0; i < segmentElements.length; i++) {
                const segmentElement = segmentElements[i];
                // @ts-ignore
                atomized[i] = new Segment(segmentElement);
            }
            return atomized;
        } catch (e) {
            console.warn(e);
            return [];
        }
    }

    headInnerHTML() {
        const head = this.findHead();
        return new XMLSerializer().serializeToString(head as Node);
    }

    findHead() {
        return AtomizedDocument.find(this.document, (n) => {
            // @ts-ignore
            return n.tagName === "head";
        });
    }

    bodyInnerHTML() {
        const body = this.findBody();
        return new XMLSerializer().serializeToString(body);
    }

    findBody(): Element {
        // @ts-ignore
        return AtomizedDocument.find(this.document, (n) => {
            // @ts-ignore
            return n.tagName === "body";
        });
    }

    ensurePopperContainer() {
        if (!this.findPopperContainer()) {
            const popperEl = this.document.createElement("div");
            popperEl.setAttribute("class", "popper-container");
            const body = this.findBody();
            body.insertBefore(popperEl, body.firstChild);
            if (!this.findPopperContainer()) {
                throw new Error("Cannot find popper container");
            }
        }
        // @ts-ignore
        return AtomizedDocument.find(this.document, (n) => {
            // @ts-ignore
            return n.tagName === "body";
        });
    }

    findPopperContainer() {
        // @ts-ignore
        return AtomizedDocument.find(this.document, (n) => {
            // @ts-ignore
            const namedItem = n.attributes?.getNamedItem("class")?.nodeValue;
            return namedItem === "popper-container";
        });
    }

    toString() {
        return new XMLSerializer().serializeToString(this.document);
    }
}

const ERROR_DOCUMENT = new AtomizedDocument(
    AtomizedDocument.getDomParser().parseFromString(
        InterpolateService.text("There was an error parsing this document"),
    ),
);
