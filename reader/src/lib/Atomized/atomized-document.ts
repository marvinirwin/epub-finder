import {getIndexOfEl} from "../Util/getIndexOfEl";
import {Dictionary, uniqueId, flatten} from 'lodash';
import {DOMParser, XMLSerializer} from "xmldom";
import {Segment} from "./segment";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {splitKeepDelim} from "../Util/Util";
import {InterpolateService} from "@shared/";
import {computeElementIndexMap} from "./compute-element-index-map";

export const ANNOTATE_AND_TRANSLATE = 'annotated_and_translated';

export function createPopperElement(document1: XMLDocument) {
    const popperEl = document1.createElement('div');
    const popperId = uniqueId();
    popperEl.setAttribute("class", "translation-popover");
    popperEl.setAttribute('id', AtomizedDocument.getPopperId(popperId));
    popperEl.setAttribute("class", "POPPER_ELEMENT");
    return {popperEl, popperId};
}

export class AtomizedDocument {
    private elementIndexMap: Map<XMLDocumentNode, number> = new Map();

    public static getPopperId(popperId: string) {
        return `translate-popper_${popperId}`;
    }

    public static atomizeDocument(xmlsource: string): AtomizedDocument {
        const doc = new AtomizedDocument(AtomizedDocument.getDomParser()
            .parseFromString(xmlsource, 'text/html'));
        doc.ensurePopperContainer();
        doc.replaceDocumentSources(doc.document);
        doc.createMarksUnderLeaves(doc.getTextElements(doc.document));
        return doc;
    }

    public static find(document: XMLDocument, cb: (n: Node) => boolean): Node | undefined {
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
                    if (node.localName === 'script') break;
                    // @ts-ignore
                    if (node.localName === 'style') break;
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

        return walk(document, n => {
            return cb(n)
        });
    }

    public static fromAtomizedString(atomizedString: string) {
        try {
            return new AtomizedDocument(
                AtomizedDocument.getDomParser().parseFromString(atomizedString)
            );
        } catch (e) {
            return ERROR_DOCUMENT;
        }
    }

    public static getDomParser() {
        return new DOMParser({
            errorHandler: {
                warning: w => {
                },
                error: w => {
                },
                fatalError: w => {
                    throw w;
                }
            }
        });
    }

    private static replaceHrefOrSource(el: Element, qualifiedName: string) {
        const currentSource = el.getAttribute(qualifiedName);
        if (currentSource && !currentSource.startsWith("data")) {
            el.setAttribute(qualifiedName, `${process.env.PUBLIC_URL}/${currentSource}`);
        }
    }

    constructor(public document: XMLDocument) {
    }

    private getTextElements(doc: Document) {
        const leaves: Element[] = [];

        function walk(node: Node, cb: (n: Node) => any) {
            let child, next;
            switch (node.nodeType) {
                case 3: // Text node
                    cb(node);
                    break;
                case 1: // Element node
                    // @ts-ignore
                    if (node.localName === 'script') break;
                    // @ts-ignore
                    if (node.localName === 'style') break;
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
                leaves.push(node as Element);
            }
        })
        return leaves;
    }

    private makeTextNodeRehydratable(textNode: Element): XMLDocumentNode {
        const document1 = this.document;
        const nodeValue = textNode.nodeValue as string;
        const newParent = this.replaceTextNodeWithSubTextNode(
            textNode,
            nodeValue
                .normalize()
                .trim()
                .split(''),
            "mark"
        );
        const {popperEl, popperId} = createPopperElement(document1);
        newParent.setAttribute('popper-id', popperId);
        newParent.setAttribute("class", ANNOTATE_AND_TRANSLATE);
        (this.findPopperContainer() as Node).insertBefore(popperEl, popperEl.firstChild);
        return newParent as unknown as XMLDocumentNode;
    }

    private replaceTextNodeWithSubTextNode(textNode: Element, newSubStrings: string[], newTagType: string) {
        const indexOfParent = textNode?.parentNode &&
             this.elementIndexMap.get(textNode.parentNode as unknown as XMLDocumentNode)
        if (!indexOfParent) {
            throw new Error("No parent index");
        }
        const indexOfMe = getIndexOfEl(textNode);
        (textNode.parentNode as Element).removeChild(textNode);
        const newParent = this.document.createElement('span');
        newSubStrings.forEach((string, index) => {
            // I'll probably need to do labelling later so the data can be rehydrated
            // Perhaps this is inefficient, but for character based stuff its probably fine
            const mark = this.document.createElement(newTagType);
            const textNode = this.document.createTextNode(string);
            mark.setAttribute('nodeindex', `${index}`);
            mark.insertBefore(textNode, null);
            newParent.insertBefore(mark, null)
        })
        const oldParent = textNode.parentNode as Element;
        oldParent.insertBefore(newParent, oldParent.childNodes.length ? oldParent.childNodes[indexOfMe] : null);
        return newParent;
    }

    private replaceDocumentSources(doc: Document) {
        const walk = (node: Node) => {
            let child, next;
            switch (node.nodeType) {
                case 1: // Element node
                    const el = node as Element;
                    AtomizedDocument.replaceHrefOrSource(el, "src");
                    if (el.localName === "link") {
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
        }
        walk(doc);
        return doc;
    }

    private createMarksUnderLeaves(textNodes: Element[]) {
        this.regenerateElementIndexMap();
        for (let i = 0; i < textNodes.length; i++) {
            this.makeTextNodeRehydratable(textNodes[i]);
        }
    }

    public segments(): Segment[] {
        try {
            const segmentElements = this.document.getElementsByClassName(ANNOTATE_AND_TRANSLATE)
            const atomized = new Array(segmentElements.length);
            for (let i = 0; i < segmentElements.length; i++) {
                const segmentElement = segmentElements[i];
                atomized[i] = new Segment(segmentElement as unknown as XMLDocumentNode);
            }
            return atomized;
        } catch (e) {
            console.warn(e);
            return [];
        }
    }

    public headInnerHTML() {
        const head = this.findHead();
        return (new XMLSerializer()).serializeToString(head as Node)
    }

    private findHead() {
        return AtomizedDocument.find(this.document, n => {
            // @ts-ignore
            return n.tagName === 'head';
        });
    }

    public bodyInnerHTML() {
        const body = this.findBody();
        return (new XMLSerializer()).serializeToString(body as Node)
    }

    private findBody(): Element {
        // @ts-ignore
        return AtomizedDocument.find(this.document, n => {
            // @ts-ignore
            return n.tagName === 'body';
        });
    }

    private ensurePopperContainer() {
        if (!this.findPopperContainer()) {
            const popperEl = this.document.createElement('div');
            popperEl.setAttribute("class", "popper-container");
            const body = this.findBody();
            body.insertBefore(popperEl, body.firstChild);
            if (!this.findPopperContainer()) {
                throw new Error("Cannot find popper container")
            }
        }
        // @ts-ignore
        return AtomizedDocument.find(this.document, n => {
            // @ts-ignore
            return n.tagName === 'body';
        });
    }

    private findPopperContainer() {
        // @ts-ignore
        return AtomizedDocument.find(this.document, (n) => {
            // @ts-ignore
            const namedItem = n.attributes?.getNamedItem('class')?.nodeValue;
            return namedItem === 'popper-container';
        });
    }

    private regenerateElementIndexMap() {
        this.elementIndexMap = computeElementIndexMap(this.document);
    }

    public toString() {
        return new XMLSerializer().serializeToString(this.document);
    }
}

const ERROR_DOCUMENT = new AtomizedDocument(
    AtomizedDocument.getDomParser()
        .parseFromString(
            InterpolateService.text(`There was an error parsing this document`)
        )
);
