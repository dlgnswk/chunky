import SettingArea from './SettingArea';
import LayerArea from './LayerArea';
import DrawingArea from './DrawingArea';

import './style.scss';
import ButtonArea from './ButtonArea';

function Studio() {
  return (
    <div className="work-space">
      <div className="side-panel">
        <SettingArea />
        <LayerArea />
      </div>
      <div className="main-panel">
        <DrawingArea />
        <ButtonArea />
      </div>
    </div>
  );
}

export default Studio;
