import * as THREE from 'three';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

function bezierModel(path, depth, canvasSize, fill) {
  const shape = new THREE.Shape();

  path.curves.forEach((curve, index) => {
    const [x1, y1] = convert2Dto3D(curve.x1, curve.y1, 0, canvasSize);
    const [x2, y2] = convert2Dto3D(curve.x2, curve.y2, 0, canvasSize);

    if (index === 0) {
      shape.moveTo(x1, y1);
    }

    if (curve.type === 'bezier') {
      const [cx, cy] = convert2Dto3D(curve.cx, curve.cy, 0, canvasSize);
      shape.quadraticCurveTo(cx, cy, x2, y2);
    } else if (curve.type === 'line') {
      shape.lineTo(x2, y2);
    }
  });

  shape.closePath();

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
