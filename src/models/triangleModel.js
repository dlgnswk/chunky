import * as THREE from 'three';

function triangleModel(path, depth) {
  const { points, fill, type } = path;

  if (type !== 'triangle' || points.length !== 3) {
    return null;
  }

  const shape = new THREE.Shape();

  shape.moveTo(points[0].x, points[0].y);
  shape.lineTo(points[1].x, points[1].y);
  shape.lineTo(points[2].x, points[2].y);
  shape.lineTo(points[0].x, points[0].y);

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const triangle = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const center = new THREE.Vector3();
  triangle.computeBoundingBox();
  triangle.boundingBox.getCenter(center);
  triangle.translate(-center.x, -center.y, -depth / 2);

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(fill),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(triangle, material);

  return { geometry: triangle, material, mesh };
}

export default triangleModel;
