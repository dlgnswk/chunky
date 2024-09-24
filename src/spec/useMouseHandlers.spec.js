import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useMouseHandlers from '../hooks/useMouseHandlers';

vi.mock('../src/store/store', () => ({
  default: () => ({
    updateLayerInFirestore: vi.fn(),
  }),
}));

describe('useMouseHandlers', () => {
  const setupProps = () => ({
    selectedTool: 'line',
    offset: { x: 0, y: 0, scale: 1 },
    setOffset: vi.fn(),
    setDragging: vi.fn(),
    setStartPoint: vi.fn(),
    dragging: false,
    startPoint: null,
    canvasRef: { current: document.createElement('canvas') },
    addPathToLayer: vi.fn(),
    selectedLayer: { id: '1', path: [] },
    layerList: [{ id: '1', path: [] }],
    setLayerList: vi.fn(),
    renderCanvas: vi.fn(),
    refreshLayerState: vi.fn(),
  });

  it('should initialize with correct default values', () => {
    const props = setupProps();

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    expect(result.current.lineStart).toBeNull();
    expect(result.current.lineEnd).toBeNull();
    expect(result.current.isDrawingPolyline).toBeFalsy();
    expect(result.current.currentPolyline).toEqual([]);
  });

  it('should handle mouse down for line tool', () => {
    const props = setupProps();

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    act(() => {
      result.current.handleMouseDown({ clientX: 100, clientY: 100 });
    });

    expect(result.current.isDrawingPolyline).toBeTruthy();
    expect(result.current.lineStart).toEqual({ x: 100, y: 100 });
    expect(result.current.lineEnd).toEqual({ x: 100, y: 100 });
    expect(result.current.currentPolyline).toEqual([{ x: 100, y: 100 }]);
  });

  it('should call renderCanvas on initial render', () => {
    const props = setupProps();

    renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    expect(props.renderCanvas).toHaveBeenCalledTimes(1);
  });

  it('should call setOffset when dragging and tool is move', () => {
    const props = setupProps();
    props.selectedTool = 'move';
    props.dragging = true;
    props.startPoint = { x: 50, y: 50 };

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    act(() => {
      result.current.handleMouseMove({ clientX: 100, clientY: 100 });
    });

    expect(props.setOffset).toHaveBeenCalledWith({ x: 50, y: 50 });
  });

  it('should stop dragging on mouse up when tool is move', () => {
    const props = setupProps();
    props.selectedTool = 'move';
    props.dragging = true;

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    act(() => {
      result.current.handleMouseUp();
    });

    expect(props.setDragging).toHaveBeenCalledWith(false);
  });

  it('should initialize isDrawingPolyline as false', () => {
    const props = setupProps();

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    expect(result.current.isDrawingPolyline).toBe(false);
  });

  it('should start drawing polyline on mouse down when tool is line', () => {
    const props = setupProps();

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    act(() => {
      result.current.handleMouseDown({ clientX: 100, clientY: 100 });
    });

    expect(result.current.isDrawingPolyline).toBe(true);
  });
});

describe('useMouseHandlers - specific lines testing', () => {
  const setupProps = () => ({
    selectedTool: 'line',
    offset: { x: 0, y: 0, scale: 1 },
    setOffset: vi.fn(),
    setDragging: vi.fn(),
    setStartPoint: vi.fn(),
    dragging: false,
    startPoint: null,
    canvasRef: { current: document.createElement('canvas') },
    addPathToLayer: vi.fn(),
    selectedLayer: { id: '1', path: [] },
    layerList: [{ id: '1', path: [] }],
    setLayerList: vi.fn(),
    renderCanvas: vi.fn(),
    refreshLayerState: vi.fn(),
  });

  it('should correctly initialize state', () => {
    const props = setupProps();

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    expect(result.current.lineStart).toBeNull();
    expect(result.current.lineEnd).toBeNull();
    expect(result.current.isDrawingPolyline).toBeFalsy();
    expect(result.current.currentPolyline).toEqual([]);
  });

  it('should handle mouse down for line tool', () => {
    const props = setupProps();

    const { result } = renderHook(() =>
      useMouseHandlers(
        props.selectedTool,
        props.offset,
        props.setOffset,
        props.setDragging,
        props.setStartPoint,
        props.dragging,
        props.startPoint,
        props.canvasRef,
        props.addPathToLayer,
        props.selectedLayer,
        props.layerList,
        props.setLayerList,
        props.renderCanvas,
        props.refreshLayerState,
      ),
    );

    act(() => {
      result.current.handleMouseDown({ clientX: 100, clientY: 100 });
    });

    expect(result.current.isDrawingPolyline).toBeTruthy();
    expect(result.current.lineStart).toEqual({ x: 100, y: 100 });
    expect(result.current.lineEnd).toEqual({ x: 100, y: 100 });
    expect(result.current.currentPolyline).toEqual([{ x: 100, y: 100 }]);
  });
});
