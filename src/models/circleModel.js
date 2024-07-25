import * as THREE from 'three';

function circleModel(path, depth) {
  const { radius, x, y } = path;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const circle = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  circle.translate(x, y, -depth / 2);
  return circle;
}

export default circleModel;
