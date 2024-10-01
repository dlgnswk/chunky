const renderToolRectangle = (ctx, { rectStart, rectEnd }) => {
  if (rectStart && rectEnd) {
    ctx.beginPath();
    ctx.rect(
      Math.min(rectStart.x, rectEnd.x),
      Math.min(rectStart.y, rectEnd.y),
      Math.abs(rectEnd.x - rectStart.x),
      Math.abs(rectEnd.y - rectStart.y),
    );

    ctx.strokeStyle = 'tomato';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

export default renderToolRectangle;
