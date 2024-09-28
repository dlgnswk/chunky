const handleStart = (event, state) => {
  const { setDragging, setStartPoint, offset } = state;

  setDragging(true);
  setStartPoint({
    x: event.clientX - offset.x,
    y: event.clientY - offset.y,
  });
};

const handleMove = (event, state) => {
  const { dragging, startPoint, setOffset } = state;

  if (dragging) {
    setOffset({
      x: event.clientX - startPoint.x,
      y: event.clientY - startPoint.y,
    });
  }
};

const handleEnd = (state) => {
  const { setDragging } = state;

  setDragging(false);
};

export default {
  handleStart,
  handleMove,
  handleEnd,
};
