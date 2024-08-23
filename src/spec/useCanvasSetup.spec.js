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
      width: 800, // 초기 scale 값을 작게 설정하기 위해 화면 크기를 canvas와 동일하게 설정
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

    expect(result.current.scale).toBeLessThanOrEqual(1); // 초기 scale 값을 확인
    expect(result.current.offset.x).toBeGreaterThanOrEqual(0); // 초기 offset 값 확인
    expect(result.current.offset.y).toBeGreaterThanOrEqual(0); // 초기 offset 값 확인
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
    expect(result.current.offset.x).toBeLessThan(0); // Offset이 이동했는지 확인
    expect(result.current.offset.y).toBeLessThan(0); // Offset이 이동했는지 확인
  });

  it('should handle wheel events correctly (zoom out)', () => {
    const { result } = renderHook(() =>
      useCanvasSetup(canvasSize, screenRef, canvasRef),
    );

    // 초기 scale 값을 충분히 작게 설정하여 zoom out 테스트가 예상대로 동작하도록 설정
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

    expect(result.current.scale).toBeLessThan(1); // zoom out 후 scale이 감소했는지 확인
    expect(result.current.offset.x).toBeGreaterThanOrEqual(0); // Offset이 이동했는지 확인
    expect(result.current.offset.y).toBeGreaterThanOrEqual(0); // Offset이 이동했는지 확인
  });

  it('should clean up the event listener on unmount', () => {
    const { result, unmount } = renderHook(() =>
      useCanvasSetup(canvasSize, screenRef, canvasRef),
    );

    const removeEventListenerSpy = vi.spyOn(
      screenRef.current,
      'removeEventListener',
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'wheel',
      screenRef.current.addEventListener.mock.calls[0][1], // 이전에 설정된 핸들러 전달
    );
  });
});
