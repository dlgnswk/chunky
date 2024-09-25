function renderToolCircle(ctx, { circleCenter, currentMousePos }) {
  if (circleCenter) {
    const radius = Math.sqrt(
      (currentMousePos.x - circleCenter.x) ** 2 +
        (currentMousePos.y - circleCenter.y) ** 2,
    );
    ctx.beginPath();
    ctx.arc(circleCenter.x, circleCenter.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'tomato';
    ctx.stroke();
  }
}

export default renderToolCircle;
