function renderEraserArea(ctx, isErasing, eraserStart, eraserEnd, scale) {
  if (isErasing && eraserStart && eraserEnd) {
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2 / scale;
    ctx.setLineDash([5 / scale, 5 / scale]);
    ctx.beginPath();
    ctx.rect(
      eraserStart.x,
      eraserStart.y,
      eraserEnd.x - eraserStart.x,
      eraserEnd.y - eraserStart.y,
    );
    ctx.stroke();
    ctx.restore();
  }
}

export default renderEraserArea;
