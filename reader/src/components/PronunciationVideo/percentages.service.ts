export const percentagePosition = (sectionDuration: number, temporalPosition: number) => {
    return (temporalPosition % sectionDuration) / sectionDuration * 100;
}