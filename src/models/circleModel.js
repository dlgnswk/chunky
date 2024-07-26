import * as THREE from 'three';
import convert2Dto3D from '../r3f-utils/convert2Dto3D';

function circleModel(path, depth, canvasSize, fill) {
  const { radius, center } = path;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  const extrudeSettings = {
    steps: 1,
    depth,
    bevelEnabled: false,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const [x3D, y3D] = convert2Dto3D(center.x, center.y, 0, canvasSize);
  geometry.translate(x3D, y3D, 0);

  const material = new THREE.MeshPhongMaterial({
    color: new THREE.Color(fill),
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return { geometry, material, mesh };
}

export default circleModel;
