const renderToolSnapPoint = (ctx, snapPoint) => {
  ctx.beginPath();
  ctx.arc(snapPoint.x, snapPoint.y, 2, 0, 2 * Math.PI);
  ctx.fillStyle = 'tomato';
  ctx.fill();
};

export default renderToolSnapPoint;
