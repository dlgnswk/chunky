import SettingArea from './SettingArea';
import LayerArea from './LayerArea';
import DrawingArea from './DrawingArea';
import ButtonArea from './ButtonArea';

import './style.scss';

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
