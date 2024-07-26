import * as THREE from 'three';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

function rectangleModel(path, depth, canvasSize, fill) {
  const { x, y, width, height } = path;
  const shape = new THREE.Shape();

  const [x1, y1] = convert2Dto3D(x, y, 0, canvasSize);
  const [x2, y2] = convert2Dto3D(x + width, y + height, 0, canvasSize);

  shape.moveTo(x1, y1);
  shape.lineTo(x2, y1);
  shape.lineTo(x2, y2);
  shape.lineTo(x1, y2);
  shape.lineTo(x1, y1);

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const rectangle = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(fill),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(rectangle, material);

  return { geometry: rectangle, material, mesh };
}

export default rectangleModel;
