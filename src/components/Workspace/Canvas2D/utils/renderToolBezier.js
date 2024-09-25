function renderToolBezier(
  ctx,
  { bezierStart, bezierEnd, bezierControl, currentMousePos },
) {
  if (bezierStart && bezierEnd) {
    ctx.beginPath();
    ctx.moveTo(bezierStart.x, bezierStart.y);
    ctx.quadraticCurveTo(
      bezierControl ? bezierControl.x : currentMousePos.x,
      bezierControl ? bezierControl.y : currentMousePos.y,
      bezierEnd.x,
      bezierEnd.y,
    );
    ctx.strokeStyle = 'tomato';
    ctx.stroke();
  }
}

export default renderToolBezier;
