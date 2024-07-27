import {
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from 'react-icons/ai';
import { PiResize } from 'react-icons/pi';

import useStore from '../../store/store';

function LayerImage({ layer, index, name, visible }) {
  const { updateLayer, removeLayer } = useStore((state) => ({
    updateLayer: state.updateLayer,
    removeLayer: state.removeLayer,
  }));

  const handleVisibleClick = (e) => {
    e.stopPropagation();
    updateLayer(index, { visible: !visible });
  };

  const handleRemoveClick = () => {
    removeLayer(index);
  };

  const handleImageResize = () => {};

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    updateLayer(index, { opacity: newOpacity });
  };

  return (
    <div className="layer-card ">
      <div className="layer-image-wrapper">
        <button className="layer-visible" onClick={handleVisibleClick}>
          {visible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
        </button>
        <div className="layer-info">
          <div className="layer-image">
            <div className="layer-image-info">
              <span className="image-title">{name}</span>
              <div className="layer-image-setting">
                <div className="layer-image-size">
                  <span className="input-label">h : </span>
                  <input value={layer.height} readOnly />
                </div>
                <div className="layer-image-size">
                  <span className="input-label">w :</span>
                  <input value={layer.width} readOnly />
                </div>
              </div>
            </div>
            <div className="layer-icon">
              <button
                className="layer-resize"
                aria-label="layer image resizing button"
                onClick={handleImageResize}
              >
                <PiResize />
              </button>
              <button
                className="layer-delete"
                aria-label="layer remove button"
                onClick={handleRemoveClick}
              >
                <AiOutlineDelete />
              </button>
            </div>
          </div>
          <div className="layer-opacity">
            <span className="input-label">Opacity</span>
            <input
              className="image-opacity"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.opacity}
              onChange={handleOpacityChange}
            />
            <span>{Math.round(layer.opacity * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayerImage;
