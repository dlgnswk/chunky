import * as THREE from 'three';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

function triangleModel(path, depth, canvasSize, fill) {
  const { points, type } = path;
  if (type !== 'triangle' || points.length !== 3) {
    return null;
  }

  const shape = new THREE.Shape();

  const convertedPoints = points.map((point) => {
    const [x3D, y3D] = convert2Dto3D(point.x, point.y, 0, canvasSize);
    return { x: x3D, y: y3D };
  });

  shape.moveTo(convertedPoints[0].x, convertedPoints[0].y);
  shape.lineTo(convertedPoints[1].x, convertedPoints[1].y);
  shape.lineTo(convertedPoints[2].x, convertedPoints[2].y);
  shape.lineTo(convertedPoints[0].x, convertedPoints[0].y);

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const triangle = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(fill),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(triangle, material);

  return { geometry: triangle, material, mesh };
}

export default triangleModel;
