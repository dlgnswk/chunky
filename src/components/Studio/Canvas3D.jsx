import { IoCubeOutline } from 'react-icons/io5';
import { useState } from 'react';

import useStore from '../../store/store';

import ToolBox from './ToolBox';

function Canvas3D() {
  const { layerList, viewToolList } = useStore();
  const [selectedTool, setSelectedTool] = useState('viewPerspective');

  const selectTool = (tool) => {
    setSelectedTool((prevTool) => (prevTool === tool ? null : tool));
  };

  return (
    <div className="canvas-3d">
      <ToolBox
        type="3d"
        iconList={viewToolList}
        selectTool={selectTool}
        selectedTool={selectedTool}
      />
      {layerList.length === 0 && (
        <div className="default-logo">
          <IoCubeOutline />
        </div>
      )}
      <canvas className="rendering-canvas"></canvas>
    </div>
  );
}

export default Canvas3D;
