const drawBezierCurve = (ctx, x1, y1, x2, y2, cx, cy, color, lineWidth) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
};

export default drawBezierCurve;
