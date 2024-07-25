import * as THREE from 'three';

function rectangleModel(path, depth) {
  const { width, height, x, y } = path;
  const shape = new THREE.Shape();

  shape.moveTo(0, 0);
  shape.lineTo(width, 0);
  shape.lineTo(width, height);
  shape.lineTo(0, height);
  shape.lineTo(0, 0);

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const rectangle = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  rectangle.translate(x, y, -depth / 2);
  return rectangle;
}

export default rectangleModel;
