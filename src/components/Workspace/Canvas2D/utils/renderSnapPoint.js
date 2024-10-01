const renderSnapPoint = (ctx, snapPoint, selectedTool, scale) => {
  if (
    snapPoint &&
    (selectedTool === 'line' ||
      selectedTool === 'bezier' ||
      selectedTool === 'rectangle' ||
      selectedTool === 'triangle' ||
      selectedTool === 'circle')
  ) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(snapPoint.x, snapPoint.y, 5 / scale, 0, 2 * Math.PI);
    ctx.fillStyle = '#0068ff';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2 / scale;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(snapPoint.x - 7 / scale, snapPoint.y);
    ctx.lineTo(snapPoint.x + 7 / scale, snapPoint.y);
    ctx.moveTo(snapPoint.x, snapPoint.y - 7 / scale);
    ctx.lineTo(snapPoint.x, snapPoint.y + 7 / scale);
    ctx.strokeStyle = '#0068ff';
    ctx.lineWidth = 2 / scale;
    ctx.stroke();
    ctx.restore();
  }
};

export default renderSnapPoint;
