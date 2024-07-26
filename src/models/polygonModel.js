import * as THREE from 'three';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

function polygonModel(path, depth, canvasSize, fill) {
  const { points, closed, type } = path;

  if (type !== 'polyline' || !Array.isArray(points) || points.length < 2) {
    return null;
  }

  const shape = new THREE.Shape();

  const convertedPoints = points.map((point) => {
    const [x3D, y3D] = convert2Dto3D(point.x, point.y, 0, canvasSize);
    return new THREE.Vector2(x3D, y3D);
  });

  shape.setFromPoints(convertedPoints);

  if (closed) {
    shape.closePath();
  }

  const extrudeSettings = {
    depth,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(fill),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return { geometry, material, mesh };
}

export default polygonModel;
