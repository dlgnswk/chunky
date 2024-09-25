function renderToolRectangle(ctx, { rectStart, currentMousePos }) {
  if (rectStart) {
    ctx.beginPath();
    ctx.rect(
      rectStart.x,
      rectStart.y,
      currentMousePos.x - rectStart.x,
      currentMousePos.y - rectStart.y,
    );
    ctx.strokeStyle = 'tomato';
    ctx.stroke();
  }
}

export default renderToolRectangle;
