const renderToolLine = (
  ctx,
  { isDrawingPolyline, currentPolyline, lineEnd },
) => {
  if (isDrawingPolyline && currentPolyline.length > 0) {
    ctx.beginPath();
    ctx.moveTo(currentPolyline[0].x, currentPolyline[0].y);
    for (let i = 1; i < currentPolyline.length; i += 1) {
      ctx.lineTo(currentPolyline[i].x, currentPolyline[i].y);
    }
    ctx.strokeStyle = '#0068ff';
    ctx.lineWidth = 1;
    ctx.stroke();

    if (lineEnd) {
      ctx.beginPath();
      ctx.moveTo(
        currentPolyline[currentPolyline.length - 1].x,
        currentPolyline[currentPolyline.length - 1].y,
      );
      ctx.lineTo(lineEnd.x, lineEnd.y);
      ctx.strokeStyle = 'tomato';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (currentPolyline.length > 2 && lineEnd) {
      const distToStart = Math.hypot(
        lineEnd.x - currentPolyline[0].x,
        lineEnd.y - currentPolyline[0].y,
      );
      if (distToStart < 10) {
        ctx.beginPath();
        ctx.moveTo(lineEnd.x, lineEnd.y);
        ctx.lineTo(currentPolyline[0].x, currentPolyline[0].y);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = 'gray';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
};

export default renderToolLine;
