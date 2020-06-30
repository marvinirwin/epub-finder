export function getIndexOfEl(textNode: Element): number {
    for (var indexOfMe = 0; (textNode = <Element>textNode.previousSibling); indexOfMe++) ;
    return indexOfMe;
}