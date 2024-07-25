import * as THREE from 'three';

function polygonModel(path, depth) {
  const { points } = path;
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) {
    shape.lineTo(points[i].x, points[i].y);
  }

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const polygon = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return polygon;
}

export default polygonModel;
