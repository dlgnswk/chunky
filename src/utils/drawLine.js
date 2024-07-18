const drawLine = (
  ctx,
  startX,
  startY,
  endX,
  endY,
  color = '#000',
  width = 2,
) => {
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);

  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.stroke();
};

export default drawLine;
