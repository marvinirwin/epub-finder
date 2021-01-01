export const draw = (normalizedData: number[], canvas: HTMLCanvasElement, durationRatio: number) => {
    const ctx: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
    // draw the line segments
    const lineWidth = (canvas.width * durationRatio) / normalizedData.length;
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