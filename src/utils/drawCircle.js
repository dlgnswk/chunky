const drawCircle = (ctx, center, radius, color, lineWidth) => {
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

export default drawCircle;
