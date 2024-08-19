import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import bezierModel from '../models/bezierModel';

vi.mock('../r3f-utils/convert2Dto3D', () => ({
  default: vi.fn((x, y, z) => [x, y, z]),
}));

describe('bezierModel', () => {
  it('should return a valid 3D model with geometry, material, and mesh', () => {
    const path = {
      curves: [
        { type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 },
        {
          type: 'bezier',
          x1: 100,
          y1: 100,
          x2: 200,
          y2: 200,
          cx: 150,
          cy: 150,
        },
      ],
    };
    const depth = 5;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#ff0000';

    const result = bezierModel(path, depth, canvasSize, fill);

    expect(result).toHaveProperty('geometry');
    expect(result).toHaveProperty('material');
    expect(result).toHaveProperty('mesh');

    expect(result.geometry).toBeInstanceOf(THREE.ExtrudeGeometry);
    expect(result.material).toBeInstanceOf(THREE.MeshPhongMaterial);
    expect(result.mesh).toBeInstanceOf(THREE.Mesh);

    expect(result.material.color).toEqual(new THREE.Color(fill));
  });
});
