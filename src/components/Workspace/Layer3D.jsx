import { useEffect, useRef } from 'react';
import createModels from '../../models/createModels';
import useStore from '../../store/store';

function Layer3D({ layer, zPosition, thickness }) {
  const groupRef = useRef();
  const { canvasSize } = useStore();

  useEffect(() => {
    if (layer && layer.path && layer.path.length > 0 && groupRef.current) {
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }

      layer.path.forEach((path) => {
        const result = createModels(
          path,
          layer.height,
          canvasSize,
          false,
          layer.fill,
        );

        if (result && result.mesh) {
          result.mesh.position.z = zPosition;
          result.mesh.castShadow = true;
          result.mesh.receiveShadow = true;

          groupRef.current.add(result.mesh);
        }
      });

      groupRef.current.visible = groupRef.current.children.length > 0;
    } else if (groupRef.current) {
      groupRef.current.visible = false;
    }
  }, [layer, zPosition, thickness, canvasSize]);

  if (!layer || !layer.path || layer.path.length === 0) {
    return null;
  }

  return <group ref={groupRef} />;
}

export default Layer3D;
