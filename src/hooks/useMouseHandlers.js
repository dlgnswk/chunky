// src/hooks/useMouseHandlers.js
import { useState } from 'react';
import drawLine from '../utils/drawLine';

const useMouseHandlers = (
  selectedTool,
  offset,
  setOffset,
  setDragging,
  setStartPoint,
  dragging,
  startPoint,
  canvasRef,
) => {
  const [lineStart, setLineStart] = useState(null);
  const [lineEnd, setLineEnd] = useState(null);

  const handleMouseDown = (event) => {
    if (selectedTool === 'move') {
      setDragging(true);
      setStartPoint({
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      });
    }
  };

  const handleMouseMove = (event) => {
    if (dragging && selectedTool === 'move') {
      setOffset({
        x: event.clientX - startPoint.x,
        y: event.clientY - startPoint.y,
      });
    } else if (selectedTool === 'line' && lineStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / offset.scale;
      const y = (event.clientY - rect.top) / offset.scale;
      setLineEnd({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (selectedTool === 'move') {
      setDragging(false);
    }
  };

  const handleCanvasClick = (event) => {
    if (selectedTool === 'line') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / offset.scale;
      const y = (event.clientY - rect.top) / offset.scale;

      if (!lineStart) {
        setLineStart({ x, y });
        setLineEnd({ x, y });
      } else {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        drawLine(ctx, lineStart.x, lineStart.y, x, y, '#000', 2);
        setLineStart(null);
        setLineEnd(null);
      }
    }
  };

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleCanvasClick,
    lineStart,
    lineEnd,
  };
};

export default useMouseHandlers;
