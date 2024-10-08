import { describe, it, expect, vi } from 'vitest';
import drawGrid from '../utils/draw/drawGrid';

describe('drawGrid', () => {
  it('should draw the grid and axis lines with correct styles and positions', () => {
    const ctx = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      set strokeStyle(value) {
        this._strokeStyle = value;
      },
      get strokeStyle() {
        return this._strokeStyle;
      },
      set lineWidth(value) {
        this._lineWidth = value;
      },
      get lineWidth() {
        return this._lineWidth;
      },
      _strokeStyle: '',
      _lineWidth: 0,
    };

    const width = 90;
    const height = 90;

    drawGrid(ctx, width, height);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, width, height);

    const gridLineCalls = ctx.stroke.mock.calls.length;
    expect(ctx.strokeStyle).toBe('green');
    expect(ctx.lineWidth).toBe(2);

    const totalLines = width / 9 + 1 + (height / 9 + 1) + 2;
    expect(gridLineCalls).toBe(totalLines);

    const lastVerticalCall =
      ctx.moveTo.mock.calls[ctx.moveTo.mock.calls.length - 2];
    const lastHorizontalCall =
      ctx.moveTo.mock.calls[ctx.moveTo.mock.calls.length - 1];
    expect(lastVerticalCall).toEqual([width / 2, 0]);
    expect(lastHorizontalCall).toEqual([0, height / 2]);
  });
});
