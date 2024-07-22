function getCursorStyle(selectedTool, dragging) {
  if (selectedTool === 'move') {
    return dragging ? 'grabbing' : 'grab';
  }

  if (selectedTool === 'line' || selectedTool === 'bezier') {
    return 'url(/cursorPen.png) 16 16, auto';
  }

  if (
    selectedTool === 'rectangle' ||
    selectedTool === 'triangle' ||
    selectedTool === 'circle'
  ) {
    return 'crosshair';
  }

  if (selectedTool === 'paintBucket') {
    return 'url(/cursorPaint.png) 16 16, auto';
  }

  if (selectedTool === 'eraser') {
    return 'url(/cursorEraser.png) 16 16, auto';
  }

  return 'default';
}

export default getCursorStyle;
