import {getIndexOfEl} from "../../Util/getIndexOfEl";
import {AnnotatedElement} from "./AnnotatedElement";
import {uniqueId} from 'lodash';

export const ANNOTATE_AND_TRANSLATE = 'annotated_and_translated';

export class ReaderDocument {

    constructor(public document: XMLDocument) {}

    getTextElements(body: Element) {
        const leaves: Element[] = [];
        var walker = this.document.createTreeWalker(
            body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        let node;
        while (node = walker.nextNode()) {
            let trim = node.textContent?.trim();
            if (trim) {
                leaves.push(node as Element);
            }
        }
        return leaves;
    }

    createMarksUnderLeaves(textNodes: Element[]) {
        for (let i = 0; i < textNodes.length; i++) {
            const textNode = textNodes[i];
            const parent: Element = <Element>textNode.parentElement;
            parent.classList.add(ANNOTATE_AND_TRANSLATE);
            const myText: string = <string>textNode.textContent;
            const indexOfMe = getIndexOfEl(textNode);
            textNode.remove();
            const span = this.document.createElement('SPAN');
            myText.split('').forEach(s => {
                // I'll probably need to do labelling later so the data can be rehydrated
                // Perhaps this is inefficient, but for character based stuff its probably fine
                const mark = this.document.createElement("MARK");
                mark.textContent = s;
                parent.insertBefore(mark, null)
            })
            parent.insertBefore(span, parent.children[indexOfMe]);
            const popperId = uniqueId();
            const popperEl = this.document.createElement('DIV');
            popperEl.classList.add("translation-popover")
            popperEl.id = ReaderDocument.getPopperId(popperId);
            this.document.body.appendChild(popperEl);
        }
    }

    static getPopperId(popperId: string) {
        return `translate-popper_${popperId}`;
    }
}