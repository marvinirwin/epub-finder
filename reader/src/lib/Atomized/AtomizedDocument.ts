import {getIndexOfEl} from "../Util/getIndexOfEl";
import {uniqueId} from 'lodash';
import {DOMParser} from "xmldom";
import {AtomizedSentence} from "./AtomizedSentence";
import {XMLDocumentNode} from "../Interfaces/XMLDocumentNode";
import {splitLong} from "../Util/Util";
import {isChineseCharacter} from "../Interfaces/OldAnkiClasses/Card";

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

    constructor(public document: XMLDocument) {}

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

    appendRehydratableText(str: string): XMLDocumentNode {
        const div = this.document.createElement('div');
        const textNode = this.document.createTextNode(str);
        this.document.body.appendChild(div);
        div.appendChild(textNode);
        return this.makeTextNodeRehydratable(textNode as unknown as Element)
    }

    makeTextNodeRehydratable(textNode: Element): XMLDocumentNode {
        let document1 = this.document;
        let nodeValue = textNode.nodeValue as string;
        const newParent = this.replaceTextNodeWithSubTextNode(
            textNode,
            nodeValue.split(''),
            "mark"
        );
        const {popperEl, popperId} = createPopperElement(document1);
        newParent.setAttribute('popper-id', popperId);
        newParent.setAttribute("class", ANNOTATE_AND_TRANSLATE);
        newParent.insertBefore(popperEl, null);
        return newParent as unknown as XMLDocumentNode;
    }



    private replaceTextNodeWithSubTextNode(textNode: Element, newSubStrings: string[], newTagType: string) {
        const indexOfMe = getIndexOfEl(textNode);
        (textNode.parentNode as Element).removeChild(textNode);
        const newParent = this.document.createElement('span');
        newSubStrings.forEach(string => {
            // I'll probably need to do labelling later so the data can be rehydrated
            // Perhaps this is inefficient, but for character based stuff its probably fine
            const mark = this.document.createElement(newTagType);
            const textNode = this.document.createTextNode(string);
            mark.insertBefore(textNode, null);
            newParent.insertBefore(mark, null)
        })
        const oldParent = textNode.parentNode as Element;
        oldParent.insertBefore(newParent, oldParent.childNodes.length ? oldParent.childNodes[indexOfMe] : null);
        return newParent;
    }

    public static getPopperId(popperId: string) {
        return `translate-popper_${popperId}`;
    }

    public static atomizeDocument(xmlsource: string): AtomizedDocument {
        const doc = new AtomizedDocument(new DOMParser().parseFromString(xmlsource, 'text/html'));
        doc.replaceDocumentSources(doc.document);
        doc.splitLongTextElements(doc.getTextElements(doc.document));
        doc.createMarksUnderLeaves(doc.getTextElements(doc.document));
        return doc;
    }

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

    splitLongTextElements(textElements: Element[]) {
        textElements.forEach(textNode => {
            const split = splitLong(
                20,
                textNode.nodeValue as string,
                    (char: string) => !isChineseCharacter(char)
            );

            if (split.length > 1) {
                this.replaceTextNodeWithSubTextNode(
                    textNode,
                    split,
                    "div"
                );
            }
        })
    }

    createMarksUnderLeaves(textNodes: Element[]) {
        const body = (this.document.getElementsByTagName("body"))[0];
        for (let i = 0; i < textNodes.length; i++) {
            this.makeTextNodeRehydratable(textNodes[i]);
        }
    }

    public getAtomizedSentences(): AtomizedSentence[]  {
        const sentenceElements =  this.document.getElementsByClassName(ANNOTATE_AND_TRANSLATE)
        const atomized = new Array(sentenceElements.length);
        for (let i = 0; i < sentenceElements.length; i++) {
            const sentenceElement = sentenceElements[i];
            atomized[i] = new AtomizedSentence(sentenceElement as unknown as XMLDocumentNode);
        }
        return atomized;
    }

}

