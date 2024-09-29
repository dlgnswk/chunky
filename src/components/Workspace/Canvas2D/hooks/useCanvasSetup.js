import { useEffect, useState } from 'react';

function useCanvasSetup(canvasSize, screenRef, canvasRef) {
  const [scale, setScale] = useState(0.5);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

  const maxScale = 10;

  const updateInitialOffset = () => {
    if (screenRef.current && canvasRef.current) {
      const screenRect = screenRef.current.getBoundingClientRect();

      const initialScale =
        Math.min(
          screenRect.width / canvasSize.width,
          screenRect.height / canvasSize.height,
        ) * 0.95;

      setScale(initialScale);

      const initialOffsetX =
        (screenRect.width - canvasSize.width * initialScale) / 2;
      const initialOffsetY =
        (screenRect.height - canvasSize.height * initialScale) / 2;
      setOffset({ x: initialOffsetX, y: initialOffsetY });
    }
  };

  useEffect(() => {
    updateInitialOffset();
  }, [canvasSize.width, canvasSize.height]);

  const handleWheel = (event) => {
    const scaleFactor = 0.2;
    const { clientX, clientY } = event;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    if (event.deltaY < 0) {
      setScale((prevScale) => {
        const newScale = Math.min(prevScale + scaleFactor, maxScale);
        setOffset((prevOffset) => ({
          x: prevOffset.x - (mouseX * (newScale - prevScale)) / newScale,
          y: prevOffset.y - (mouseY * (newScale - prevScale)) / newScale,
        }));

        return newScale;
      });
    } else {
      setScale((prevScale) => {
        const newScale = Math.max(prevScale - scaleFactor, 0.1);

        setOffset((prevOffset) => ({
          x: prevOffset.x - (mouseX * (newScale - prevScale)) / newScale,
          y: prevOffset.y - (mouseY * (newScale - prevScale)) / newScale,
        }));

        return newScale;
      });
    }
  };

  useEffect(() => {
    const element = screenRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  return {
    scale,
    setScale,
    offset,
    setOffset,
    dragging,
    startPoint,
    setDragging,
    setStartPoint,
    updateInitialOffset,
  };
}

export default useCanvasSetup;
