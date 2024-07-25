import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import createModels from '../../models/createModels';

function Layer3D({ layer, zPosition, thickness }) {
  const groupRef = useRef();

  useEffect(() => {
    if (layer && layer.path && layer.path.length > 0 && groupRef.current) {
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }

      layer.path.forEach((path, index) => {
        const result = createModels(path, layer.height);

        if (result && result.isBufferGeometry) {
          const mesh = new THREE.Mesh(
            result,
            new THREE.MeshPhongMaterial({
              color: layer.fill || '#FF6347',
            }),
          );

          if (mesh.geometry.computeBoundingSphere) {
            mesh.geometry.computeBoundingSphere();
          }
          mesh.position.z = zPosition;

          groupRef.current.add(mesh);
        }
      });

      groupRef.current.visible = groupRef.current.children.length > 0;
    } else if (groupRef.current) {
      groupRef.current.visible = false;
    }
  }, [layer, zPosition, thickness]);

  if (!layer || !layer.path || layer.path.length === 0) {
    return null;
  }

  return <group ref={groupRef} />;
}

export default Layer3D;
