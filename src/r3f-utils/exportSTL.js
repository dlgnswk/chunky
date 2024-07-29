import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';

export function createSceneFromLayers(layers) {
  const scene = new THREE.Scene();

  layers.forEach((layer) => {
    if (!layer.visible) return;

    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshBasicMaterial({ color: layer.fill });

    const vertices = [];
    layer.path.forEach((pathItem) => {
      if (pathItem.type === 'circle') {
        const { center, radius } = pathItem;
        for (let i = 0; i < 32; i += 1) {
          const angle = (i / 32) * Math.PI * 2;
          vertices.push(
            center.x + Math.cos(angle) * radius,
            center.y + Math.sin(angle) * radius,
            0,
          );
        }
      } else if (pathItem.type === 'line') {
        vertices.push(pathItem.x1, pathItem.y1, 0, pathItem.x2, pathItem.y2, 0);
      }
    });

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = layer.zIndex * layer.height;
    scene.add(mesh);
  });

  return scene;
}

export function exportToSTL(layers) {
  const scene = createSceneFromLayers(layers);
  const exporter = new STLExporter();
  const stlString = exporter.parse(scene);

  const blob = new Blob([stlString], { type: 'application/octet-stream' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'export.stl';
  link.click();
  URL.revokeObjectURL(link.href);
}
