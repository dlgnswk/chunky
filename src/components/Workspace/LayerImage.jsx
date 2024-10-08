import {
  AiOutlineCheck,
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from 'react-icons/ai';
import { PiResize } from 'react-icons/pi';

import { useState } from 'react';
import useStore from '../../store/store';

function LayerImage({ layer, index, name, visible }) {
  const { updateLayer, removeLayer, updateLayerInFirestore } = useStore(
    (state) => ({
      updateLayer: state.updateLayer,
      removeLayer: state.removeLayer,
      updateLayerInFirestore: state.updateLayerInFirestore,
    }),
  );

  const [localOpacity, setLocalOpacity] = useState(layer.opacity);
  const [isResizing, setIsResizing] = useState(false);
  const [localWidth, setLocalWidth] = useState(layer.width);
  const [localHeight, setLocalHeight] = useState(layer.height);

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setLocalOpacity(newOpacity);
    updateLayer(index, { opacity: newOpacity });
  };

  const handleOpacityChangeEnd = async () => {
    const updatedLayer = { ...layer, opacity: localOpacity };
    updateLayer(index, { opacity: localOpacity });
    await updateLayerInFirestore(updatedLayer);
  };

  const handleVisibleClick = (e) => {
    e.stopPropagation();
    updateLayer(index, { visible: !visible });
  };

  const handleRemoveClick = () => {
    removeLayer(index);
  };

  const handleImageResize = () => {
    setIsResizing(!isResizing);
  };

  const handleWidthChange = (e) => {
    setLocalWidth(Number(e.target.value));
  };

  const handleHeightChange = (e) => {
    setLocalHeight(Number(e.target.value));
  };

  const handleResizeConfirm = () => {
    const updatedLayer = { ...layer, width: localWidth, height: localHeight };
    updateLayer(index, { width: localWidth, height: localHeight });
    updateLayerInFirestore(updatedLayer);
    setIsResizing(false);
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
                  {isResizing ? (
                    <input
                      value={localHeight}
                      onChange={handleHeightChange}
                      type="number"
                    />
                  ) : (
                    <input value={layer.height} readOnly />
                  )}
                </div>
                <div className="layer-image-size">
                  <span className="input-label">w :</span>
                  {isResizing ? (
                    <input
                      value={localWidth}
                      onChange={handleWidthChange}
                      type="number"
                    />
                  ) : (
                    <input value={layer.width} readOnly />
                  )}
                </div>
              </div>
            </div>
            <div className="layer-icon">
              {isResizing ? (
                <button
                  className="layer-resize-confirm"
                  aria-label="confirm image resizing"
                  onClick={handleResizeConfirm}
                >
                  <AiOutlineCheck />
                </button>
              ) : (
                <button
                  className="layer-resize"
                  aria-label="layer image resizing button"
                  onClick={handleImageResize}
                >
                  <PiResize />
                </button>
              )}
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
              value={localOpacity}
              onChange={handleOpacityChange}
              onMouseUp={handleOpacityChangeEnd}
              onTouchEnd={handleOpacityChangeEnd}
            />
            <span>{Math.round(localOpacity * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LayerImage;
