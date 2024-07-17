import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IoSquareOutline } from 'react-icons/io5';
import useStore from '../../store/store';
import ToolBox from './ToolBox';

function Canvas2D() {
  const { layerList, drawingToolList, canvasSize } = useStore();
  const canvasRef = useRef(null);
  const screenRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [wasLayerListEmpty, setWasLayerListEmpty] = useState(true);
  const [selectedTool, setSelectedTool] = useState(null);

  const updateInitialOffset = () => {
    if (screenRef.current && canvasRef.current) {
      const screenRect = screenRef.current.getBoundingClientRect();
      const initialOffsetX = (screenRect.width - canvasSize.width) / 2;
      const initialOffsetY = (screenRect.height - canvasSize.height) / 2;
      setOffset({ x: initialOffsetX, y: initialOffsetY });
    }
  };

  useEffect(() => {
    updateInitialOffset();
  }, [canvasSize.width, canvasSize.height]);

  useEffect(() => {
    if (layerList.length > 0 && wasLayerListEmpty) {
      updateInitialOffset();
      setScale(1);
      setWasLayerListEmpty(false);
    } else if (layerList.length === 0) {
      updateInitialOffset();
      setScale(1);
      setWasLayerListEmpty(true);
    }
  }, [layerList, wasLayerListEmpty, canvasSize.width, canvasSize.height]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const drawGrid = () => {
        const gridSpacing = 20;
        const { width, height } = canvasSize;

        ctx.clearRect(0, 0, width, height);

        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= width; x += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        for (let y = 0; y <= height; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      };

      drawGrid();
    }
  }, [layerList, canvasSize]);

  const selectTool = (tool) => {
    setSelectedTool((prevTool) => (prevTool === tool ? null : tool));
  };

  const handleKeyDown = useCallback((event) => {
    if (event.code === 'KeyM') {
      selectTool('move');
    } else if (event.code === 'KeyL') {
      selectTool('line');
    } else if (event.code === 'KeyA') {
      selectTool('bezier');
    } else if (event.code === 'KeyR') {
      selectTool('rectangle');
    } else if (event.code === 'KeyT') {
      selectTool('triangle');
    } else if (event.code === 'KeyC') {
      selectTool('circle');
    } else if (event.code === 'KeyE') {
      selectTool('eraser');
    } else if (event.code === 'KeyI') {
      selectTool('image');
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();
    const scaleFactor = 0.1;
    const { clientX, clientY } = event;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    if (event.deltaY < 0) {
      setScale((prevScale) => {
        const newScale = Math.min(prevScale + scaleFactor, 3);
        setOffset((prevOffset) => ({
          x: prevOffset.x - (mouseX * (newScale - prevScale)) / newScale,
          y: prevOffset.y - (mouseY * (newScale - prevScale)) / newScale,
        }));
        return newScale;
      });
    } else {
      setScale((prevScale) => {
        const newScale = Math.max(prevScale - scaleFactor, 0.5);
        setOffset((prevOffset) => ({
          x: prevOffset.x - (mouseX * (newScale - prevScale)) / newScale,
          y: prevOffset.y - (mouseY * (newScale - prevScale)) / newScale,
        }));
        return newScale;
      });
    }
  }, []);

  useEffect(() => {
    const element = screenRef.current;
    if (element) {
      element.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (element) {
        element.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel, screenRef.current]);

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
    if (dragging) {
      setOffset({
        x: event.clientX - startPoint.x,
        y: event.clientY - startPoint.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const getCursorStyle = () => {
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

    if (selectedTool === 'eraser') {
      return 'url(/cursorEraser.png) 16 16, auto';
    }

    return 'default';
  };

  return (
    <div className="canvas-2d">
      <ToolBox
        type="2d"
        iconList={drawingToolList}
        selectTool={selectTool}
        selectedTool={selectedTool}
      />
      {layerList.length === 0 && (
        <div className="default-logo">
          <IoSquareOutline />
        </div>
      )}
      {layerList.length !== 0 && (
        <button
          ref={screenRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            overflow: 'hidden',
            width: '100%',
            height: '100%',
            position: 'relative',
            cursor: getCursorStyle(),
            background: 'none',
            border: 'none',
            padding: 0,
          }}
          aria-label="Drawing canvas area"
        >
          <canvas
            ref={canvasRef}
            className="drawing-canvas"
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: '0 0',
              position: 'absolute',
              left: offset.x,
              top: offset.y,
            }}
          ></canvas>
        </button>
      )}
    </div>
  );
}

export default Canvas2D;
