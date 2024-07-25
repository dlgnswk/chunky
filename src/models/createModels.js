import * as THREE from 'three';

import rectangleModel from './rectangleModel';
import circleModel from './circleModel';
import triangleModel from './triangleModel';
import polygonModel from './polygonModel';

function createModels(path, depth, flipHorizontally = false) {
  let geometry;
  let material;

  switch (path.type) {
    case 'rectangle':
      return rectangleModel(path, depth);
    case 'circle':
      return circleModel(path, depth);
    case 'triangle':
      return triangleModel(path, depth);
    case 'polyLine':
      return polygonModel(path, depth);
    default:
      geometry = new THREE.BoxGeometry(1, 1, depth);
      material = new THREE.MeshPhongMaterial({ color: '#FF6347' });
  }

  const mesh = new THREE.Mesh(geometry, material);

  if (flipHorizontally) {
    mesh.scale.x *= -1; // X축을 기준으로 반전
    mesh.rotation.y = Math.PI; // Y축을 중심으로 180도 회전
  }

  return mesh;
}

export default createModels;
