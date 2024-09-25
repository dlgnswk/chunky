function renderToolTriangle(ctx, { trianglePoints, currentMousePos }) {
  if (trianglePoints.length > 0) {
    ctx.beginPath();
    ctx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
    for (let i = 1; i < trianglePoints.length; i += 1) {
      ctx.lineTo(trianglePoints[i].x, trianglePoints[i].y);
    }
    if (trianglePoints.length < 3) {
      ctx.lineTo(currentMousePos.x, currentMousePos.y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'tomato';
    ctx.stroke();
  }
}

export default renderToolTriangle;
