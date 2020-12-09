export const percentagePosition = (sectionDuration: number, temporalPosition: number) => {
    return (temporalPosition % sectionDuration) / sectionDuration * 100;
}

export const boundedPoints = (p1: number, p2: number, min: number, max: number): [number, number] | never[] => {
    const empty: never[] = [];
    let newp1;
    let newp2;
    if (p1 > min) {
        if (p1 < max) {
            newp1 = p1;
        } else {
            return empty;
        }
    } else {
        newp1 = min;
    }
    if (p2 < max) {
        if (p2 > min) {
            newp2 = p2;
        } else {
            return empty;
        }
    } else {
        newp2 = max;
    }
    return [
        newp1,
        newp2
    ];
}

export const orderedPoints = (p1: number, p2: number): [number, number] => {
    return (p1 > p2) ?
        [p2, p1] :
        [p1, p2];
}

