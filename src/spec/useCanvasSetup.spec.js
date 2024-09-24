import { beforeEach, expect, describe, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useCanvasSetup from '../hooks/useCanvasSetup';

describe('useCanvasSetup', () => {
  let canvasSize;
  let screenRef;
  let canvasRef;

  beforeEach(() => {
    canvasSize = { width: 800, height: 600 };

    screenRef = {
      current: {
        getBoundingClientRect: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    };

    canvasRef = {
      current: {
        getBoundingClientRect: vi.fn(),
      },
    };

    screenRef.current.getBoundingClientRect.mockReturnValue({
      width: 800,
      height: 600,
    });

    canvasRef.current.getBoundingClientRect.mockReturnValue({
      left: 0,
      top: 0,
      width: 800,
      height: 600,
    });
  });

  it('should update the initial offset on canvasSize change', () => {
    const { result } = renderHook(() =>
      useCanvasSetup(canvasSize, screenRef, canvasRef),
    );

    act(() => {
      result.current.updateInitialOffset();
    });

    expect(result.current.scale).toBeLessThanOrEqual(1);
    expect(result.current.offset.x).toBeGreaterThanOrEqual(0);
    expect(result.current.offset.y).toBeGreaterThanOrEqual(0);
  });

  it('should handle wheel events correctly (zoom in)', () => {
    const { result } = renderHook(() =>
      useCanvasSetup(canvasSize, screenRef, canvasRef),
    );

    const event = new WheelEvent('wheel', {
      deltaY: -1,
      clientX: 400,
      clientY: 300,
    });

    act(() => {
      screenRef.current.addEventListener.mock.calls[0][1](event);
    });

    expect(result.current.scale).toBeGreaterThan(0.5);
    expect(result.current.offset.x).toBeLessThan(0);
    expect(result.current.offset.y).toBeLessThan(0);
  });

  it('should handle wheel events correctly (zoom out)', () => {
    const { result } = renderHook(() =>
      useCanvasSetup(canvasSize, screenRef, canvasRef),
    );

    act(() => {
      result.current.setScale(1);
    });

    const event = new WheelEvent('wheel', {
      deltaY: 1,
      clientX: 400,
      clientY: 300,
    });

    act(() => {
      screenRef.current.addEventListener.mock.calls[0][1](event);
    });

    expect(result.current.scale).toBeLessThan(1);
    expect(result.current.offset.x).toBeGreaterThanOrEqual(0);
    expect(result.current.offset.y).toBeGreaterThanOrEqual(0);
  });

  it('should clean up the event listener on unmount', () => {
    const { unmount } = renderHook(() =>
      useCanvasSetup(canvasSize, screenRef, canvasRef),
    );

    const removeEventListenerSpy = vi.spyOn(
      screenRef.current,
      'removeEventListener',
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'wheel',
      screenRef.current.addEventListener.mock.calls[0][1],
    );
  });
});
