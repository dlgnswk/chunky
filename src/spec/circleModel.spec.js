import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import circleModel from '../models/circleModel';

vi.mock('../r3f-utils/convert2Dto3D', () => ({
  default: vi.fn((x, y, z) => [x, y, z]),
}));

describe('circleModel', () => {
  it('should return a valid 3D model with geometry, material, and mesh', () => {
    const path = {
      radius: 50,
      center: { x: 100, y: 100 },
    };
    const depth = 10;
    const canvasSize = { width: 500, height: 500 };
    const fill = '#00ff00';

    const result = circleModel(path, depth, canvasSize, fill);

    expect(result).toHaveProperty('geometry');
    expect(result).toHaveProperty('material');
    expect(result).toHaveProperty('mesh');

    expect(result.geometry).toBeInstanceOf(THREE.ExtrudeGeometry);
    expect(result.material).toBeInstanceOf(THREE.MeshPhongMaterial);
    expect(result.mesh).toBeInstanceOf(THREE.Mesh);

    expect(result.material.color).toEqual(new THREE.Color(fill));
  });
});
