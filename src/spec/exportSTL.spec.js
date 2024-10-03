import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import { createSceneFromLayers } from '../utils/exportSTL';

vi.mock('three/examples/jsm/exporters/STLExporter', () => {
  return {
    STLExporter: vi.fn().mockImplementation(() => {
      return {
        parse: vi.fn().mockReturnValue('mocked STL data'),
      };
    }),
  };
});

describe('createSceneFromLayers', () => {
  it('creates a scene with visible layers only', () => {
    const layers = [
      {
        visible: true,
        fill: 0xff0000,
        zIndex: 1,
        height: 10,
        path: [
          { type: 'circle', center: { x: 0, y: 0 }, radius: 5 },
          { type: 'line', x1: 0, y1: 0, x2: 10, y2: 10 },
        ],
      },
      {
        visible: false,
        fill: 0x00ff00,
        zIndex: 2,
        height: 20,
        path: [{ type: 'circle', center: { x: 20, y: 20 }, radius: 10 }],
      },
    ];

    const scene = createSceneFromLayers(layers);
    expect(scene.children.length).toBe(1);
    expect(scene.children[0]).toBeInstanceOf(THREE.Mesh);
  });

  it('creates geometry with correct vertices', () => {
    const layers = [
      {
        visible: true,
        fill: 0xff0000,
        zIndex: 1,
        height: 10,
        path: [{ type: 'line', x1: 0, y1: 0, x2: 10, y2: 10 }],
      },
    ];

    const scene = createSceneFromLayers(layers);
    const mesh = scene.children[0];
    const positionAttribute = mesh.geometry.getAttribute('position');

    expect(positionAttribute.array).toEqual(
      new Float32Array([0, 0, 0, 10, 10, 0]),
    );
  });
});
