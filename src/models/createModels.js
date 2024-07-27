import * as THREE from 'three';

import rectangleModel from './rectangleModel';
import circleModel from './circleModel';
import triangleModel from './triangleModel';
import polygonModel from './polygonModel';
import bezierModel from './bezierModel';

function createModels(
  path,
  depth,
  canvasSize,
  flipHorizontally = false,
  fill = 'lightgray',
) {
  let result;

  switch (path.type) {
    case 'rectangle':
      result = rectangleModel(path, depth, canvasSize, fill);
      break;
    case 'circle':
      result = circleModel(path, depth, canvasSize, fill);
      break;
    case 'triangle':
      result = triangleModel(path, depth, canvasSize, fill);
      break;
    case 'polyline':
      result = polygonModel(path, depth, canvasSize, fill);
      break;
    case 'bezier':
      result = bezierModel(path, depth, canvasSize, fill);
      break;
    default: {
      const geometry = new THREE.BoxGeometry(1, 1, depth);
      const material = new THREE.MeshStandardMaterial({
        color: fill,
        roughness: 0.7,
        metalness: 0.2,
      });
      result = { geometry, material, mesh: new THREE.Mesh(geometry, material) };
    }
  }

  if (result && result.mesh && flipHorizontally) {
    result.mesh.scale.x *= -1;
    result.mesh.rotation.y = Math.PI;
  }

  return result;
}

export default createModels;
