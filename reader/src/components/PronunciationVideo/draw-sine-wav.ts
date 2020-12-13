

const filterData = (audioBuffer: AudioBuffer) => {
    const rawData = audioBuffer.getChannelData(0); // We only need to work with one channel of data
    const samples = 1000; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i++) {
        const blockStart = blockSize * i; // the location of the first sample in the block
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
            sum = sum + Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
        }
        filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    return filteredData;
};

const normalizeData = (filteredData: number[]) => {
    const multiplier = Math.pow(Math.max(...filteredData), -1);
    return filteredData.map(n => n * multiplier);
}

export const draw = (normalizedData: number[], canvas: HTMLCanvasElement) => {
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    // draw the line segments
    const lineWidth = canvas.width / normalizedData.length;
    for (let i = 0; i < normalizedData.length; i++) {
        const x = lineWidth * i;
        const height = normalizedData[i] * canvas.height;
        drawLineSegment(ctx, x, height, canvas.height);
    }
};

const drawLineSegment = (ctx: CanvasRenderingContext2D, x: number, height: number, canvasHeight: number) => {
    ctx.lineWidth = 1; // how thick the line is
    ctx.fillStyle = "#00a0db"; // what color our line is
    ctx.fillRect(
        x,
        canvasHeight - height,
        1,
        height
    )
};