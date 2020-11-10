export function getIndexOfEl(textNode: Element): number {
    let indexOfMe = 0;
    for (indexOfMe = 0; (textNode = (textNode.previousSibling as Element)); indexOfMe++) ;
    return indexOfMe;
}