import { describe, it, expect } from 'vitest';
import getCursorStyle from '../utils/getCursorStyle';

describe('getCursorStyle', () => {
  it('should return "grabbing" when selectedTool is "move" and dragging is true', () => {
    const result = getCursorStyle('move', true);
    expect(result).toBe('grabbing');
  });

  it('should return "grab" when selectedTool is "move" and dragging is false', () => {
    const result = getCursorStyle('move', false);
    expect(result).toBe('grab');
  });

  it('should return the correct cursor for "line" tool', () => {
    const result = getCursorStyle('line', false);
    expect(result).toBe('url(/images/cursorPen.png) 16 16, auto');
  });

  it('should return the correct cursor for "bezier" tool', () => {
    const result = getCursorStyle('bezier', false);
    expect(result).toBe('url(/images/cursorPen.png) 16 16, auto');
  });

  it('should return "crosshair" for "rectangle" tool', () => {
    const result = getCursorStyle('rectangle', false);
    expect(result).toBe('crosshair');
  });

  it('should return "crosshair" for "triangle" tool', () => {
    const result = getCursorStyle('triangle', false);
    expect(result).toBe('crosshair');
  });

  it('should return "crosshair" for "circle" tool', () => {
    const result = getCursorStyle('circle', false);
    expect(result).toBe('crosshair');
  });

  it('should return the correct cursor for "paintBucket" tool', () => {
    const result = getCursorStyle('paintBucket', false);
    expect(result).toBe('url(/images/cursorPaint.png) 16 16, auto');
  });

  it('should return the correct cursor for "eraser" tool', () => {
    const result = getCursorStyle('eraser', false);
    expect(result).toBe('url(/images/cursorEraser.png) 16 16, auto');
  });

  it('should return "default" for any other tool', () => {
    const result = getCursorStyle('unknownTool', false);
    expect(result).toBe('default');
  });
});
