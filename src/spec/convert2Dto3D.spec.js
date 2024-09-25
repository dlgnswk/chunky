import { describe, it, expect } from 'vitest';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

describe('convert2Dto3D', () => {
  it('converts (x, y, z) correctly for given canvas size', () => {
    const canvasSize = { width: 200, height: 100 };

    const result1 = convert2Dto3D(100, 50, 0, canvasSize);
    expect(result1).toEqual([0, 0, 0]);

    const result2 = convert2Dto3D(200, 0, 0, canvasSize);
    expect(result2).toEqual([100, 50, 0]);

    const result3 = convert2Dto3D(0, 100, 10, canvasSize);
    expect(result3).toEqual([-100, -50, 10]);

    const result4 = convert2Dto3D(50, 25, -5, canvasSize);
    expect(result4).toEqual([-50, 25, -5]);
  });

  it('handles edge cases like the origin and corners of the canvas', () => {
    const canvasSize = { width: 300, height: 300 };

    const result1 = convert2Dto3D(0, 0, 0, canvasSize);
    expect(result1).toEqual([-150, 150, 0]);

    const result2 = convert2Dto3D(300, 0, 5, canvasSize);
    expect(result2).toEqual([150, 150, 5]);

    const result3 = convert2Dto3D(0, 300, 0, canvasSize);
    expect(result3).toEqual([-150, -150, 0]);

    const result4 = convert2Dto3D(300, 300, -5, canvasSize);
    expect(result4).toEqual([150, -150, -5]);
  });
});
