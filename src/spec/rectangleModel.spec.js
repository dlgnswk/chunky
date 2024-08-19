import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import rectangleModel from '../models/rectangleModel';

vi.mock('../r3f-utils/convert2Dto3D', () => ({
  default: vi.fn((x, y, z) => [x, y, z]),
}));

describe('rectangleModel', () => {
  it('should return a valid 3D model with geometry, material, and mesh', () => {
    const path = {
      x: 0,
      y: 0,
      width: 100,
      height: 50,
    };
    const depth = 10;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#ff00ff';

    const result = rectangleModel(path, depth, canvasSize, fill);

    expect(result).toHaveProperty('geometry');
    expect(result).toHaveProperty('material');
    expect(result).toHaveProperty('mesh');

    expect(result.geometry).toBeInstanceOf(THREE.ExtrudeGeometry);
    expect(result.material).toBeInstanceOf(THREE.MeshPhongMaterial);
    expect(result.mesh).toBeInstanceOf(THREE.Mesh);

    expect(result.material.color).toEqual(new THREE.Color(fill));
  });
});
