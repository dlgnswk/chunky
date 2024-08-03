function getCursorStyle(selectedTool, dragging) {
  if (selectedTool === 'move') {
    return dragging ? 'grabbing' : 'grab';
  }

  if (selectedTool === 'line' || selectedTool === 'bezier') {
    return 'url(/images/cursorPen.png) 16 16, auto';
  }

  if (
    selectedTool === 'rectangle' ||
    selectedTool === 'triangle' ||
    selectedTool === 'circle'
  ) {
    return 'crosshair';
  }

  if (selectedTool === 'paintBucket') {
    return 'url(/images/cursorPaint.png) 16 16, auto';
  }

  if (selectedTool === 'eraser') {
    return 'url(/images/cursorEraser.png) 16 16, auto';
  }

  return 'default';
}

export default getCursorStyle;
