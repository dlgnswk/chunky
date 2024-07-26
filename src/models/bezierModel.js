import * as THREE from 'three';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

function bezierModel(path, depth, canvasSize, fill) {
  const { cx, cy, x1, y1, x2, y2 } = path;

  const [cx3D, cy3D] = convert2Dto3D(cx, cy, 0, canvasSize);
  const [x13D, y13D] = convert2Dto3D(x1, y1, 0, canvasSize);
  const [x23D, y23D] = convert2Dto3D(x2, y2, 0, canvasSize);

  const curve = new THREE.CubicBezierCurve(
    new THREE.Vector2(cx3D, cy3D),
    new THREE.Vector2(x13D, y13D),
    new THREE.Vector2(x23D, y23D),
    new THREE.Vector2(x23D, y23D),
  );

  const points = curve.getPoints(50);

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

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(fill),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return { geometry, material, mesh };
}

export default bezierModel;
