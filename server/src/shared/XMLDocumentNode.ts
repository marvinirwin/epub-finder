export interface XMLDocumentNode {
    nodeValue: string;
    prefix: string;
    nodeName: string;
    nodeType: number;
    parentNode: XMLDocumentNode;
    childNodes: XMLDocumentNode[];
    firstChild: XMLDocumentNode | null;
    lastChild: XMLDocumentNode | null;
    previousSibling: XMLDocumentNode | null;
    nextSibling: XMLDocumentNode | null;
    // attributes: string;
    ownerDocument: XMLDocument;
    namespaceURI: string;
    localName: string;
    // method: string;
    textContent: string | null;

    insertBefore(newChild: XMLDocumentNode, refChild: XMLDocumentNode): void

    replaceChild(newChild: XMLDocumentNode, oldChild: XMLDocumentNode): void

    removeChild(oldChild: XMLDocumentNode): void

    appendChild(newChild: XMLDocumentNode): void

    hasChildNodes(): boolean

    cloneNode(deep: XMLDocumentNode): XMLDocumentNode

    getAttribute(s: string):  string | null

    setAttribute(s: string, v: string):  void

    /*
        normalize()
        isSupported(feature, version)
        hasAttributes()
    */
}