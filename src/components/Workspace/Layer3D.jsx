import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import useStore from '../../store/store';
import GroupModel from './Canvas3D/GroupModel';

function Layer3D({ layer, zPosition }) {
  const canvasSize = useStore((state) => state.canvasSize);

  if (!layer || !layer.path || layer.path.length === 0) {
    return null;
  }

  return (
    <group visible={layer.visible}>
      {layer.path.map((path) => (
        <GroupModel
          key={uuidv4()}
          path={path}
          depth={layer.height}
          canvasSize={canvasSize}
          flipHorizontally={false}
          fill={layer.fill}
          zPosition={zPosition}
        />
      ))}
    </group>
  );
}

export default Layer3D;
