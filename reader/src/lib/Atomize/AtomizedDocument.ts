import {getIndexOfEl} from "../Util/getIndexOfEl";
import {uniqueId} from 'lodash';
import {DOMParser, XMLSerializer} from "xmldom";
import {AtomizedSentence} from "./AtomizedSentence";

export const ANNOTATE_AND_TRANSLATE = 'annotated_and_translated';

export class AtomizedDocument {
    constructor(public document: XMLDocument) {}

    replaceDocumentSources(doc: Document) {
        const walk = (node: Node) => {
            var child, next;
            switch (node.nodeType) {
                case 1: // Element node
                    const el = node as Element;
                    this.replaceHrefOrSource(el, "src");
                    if (el.localName === "link") {
                        this.replaceHrefOrSource(el, "href");
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

    replaceHrefOrSource(el: Element, qualifiedName: string) {
        let currentSource = el.getAttribute(qualifiedName);
        if (currentSource && !currentSource.startsWith("data")) {
            el.setAttribute(qualifiedName, `${process.env.PUBLIC_URL}/${currentSource}`);
        }
    }

    getTextElements(doc: Document) {
        const leaves: Element[] = [];
        function walk(node: Node, cb: (n: Node) => any) {
            var child, next;
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
            let text = (node.textContent as string).trim();
            if (text)  {
                leaves.push(node as Element);
            }
        })
        return leaves;
    }

    createMarksUnderLeaves(textNodes: Element[]) {
        const body = (this.document.getElementsByTagName("body"))[0];
        for (let i = 0; i < textNodes.length; i++) {
            this.annotateTextNode(textNodes[i], i, body);
        }
    }

    annotateTextNode(textNode: Element, i: number, body: HTMLBodyElement) {
        const oldParent: Element = <Element>textNode.parentNode;
        const popperId = uniqueId();
        const myText: string = <string>textNode.nodeValue;
        const indexOfMe = getIndexOfEl(textNode);
        oldParent.removeChild(textNode);
        const newParent = this.document.createElement('span');
        newParent.setAttribute('popper-id', popperId);
        newParent.setAttribute("class", ANNOTATE_AND_TRANSLATE);
        myText.split('').forEach(char => {
            // I'll probably need to do labelling later so the data can be rehydrated
            // Perhaps this is inefficient, but for character based stuff its probably fine
            const mark = this.document.createElement("mark");
            const textNode = this.document.createTextNode(char);
            mark.insertBefore(textNode, null);
            newParent.insertBefore(mark, null)
        })
        oldParent.insertBefore(newParent, oldParent.childNodes.length ? oldParent.childNodes[indexOfMe] : null);
        const popperEl = this.document.createElement('div');
        popperEl.setAttribute("class", "translation-popover");
        popperEl.setAttribute('id', AtomizedDocument.getPopperId(popperId));
        popperEl.setAttribute("class", "POPPER_ELEMENT");
        newParent.insertBefore(popperEl, null);
    }

    public static getPopperId(popperId: string) {
        return `translate-popper_${popperId}`;
    }

    public static atomizeDocument(xmlsource: string): AtomizedDocument {
        const doc = new AtomizedDocument(new DOMParser().parseFromString(xmlsource, 'text/html'));
        doc.replaceDocumentSources(doc.document);
        doc.createMarksUnderLeaves(doc.getTextElements(doc.document));
        return doc;
    }

    public getAtomizedSentences(): AtomizedSentence[]  {
        const sentenceElements =  this.document.getElementsByClassName(ANNOTATE_AND_TRANSLATE)
        const atomized = new Array(sentenceElements.length);
        for (let i = 0; i < sentenceElements.length; i++) {
            const sentenceElement = sentenceElements[i];
            atomized[i] = new AtomizedSentence(sentenceElement);
        }
        return atomized;
    }
}

