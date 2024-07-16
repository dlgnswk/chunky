import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCopy,
  AiOutlineDelete,
} from 'react-icons/ai';
import { useState, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import useStore from '../../store/store';

function LayerCard({
  name,
  index,
  height,
  visible,
  selectLayer,
  handleSelectClick,
  moveCard,
}) {
  const { layerList, copyLayer, updateLayer, removeLayer, setAlertState } =
    useStore();
  const [newName, setNewName] = useState(name);
  const [newHeight, setNewHeight] = useState(height);

  const ref = useRef(null);

  const [, drag] = useDrag({
    type: 'LAYER_CARD',
    item: { index },
  });

  const [, drop] = useDrop({
    accept: 'LAYER_CARD',
    hover(item) {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
  });

  drag(drop(ref));

  const handleVisibleClick = (e) => {
    e.stopPropagation();
    updateLayer(index, { visible: !visible });
  };

  const handleCopyClick = () => {
    copyLayer(index);
  };

  const handleRemoveClick = () => {
    removeLayer(index);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNameBlurOrEnter = () => {
    if (
      layerList.some((layer) => layer.name === newName && layer.index !== index)
    ) {
      setNewName(name);
      setAlertState({ id: Date.now(), message: 'layer-name' });
    } else {
      updateLayer(index, { name: newName });
    }
  };

  const handleHeightChange = (e) => {
    setNewHeight(e.target.value);
  };

  const handleHeightBlurOrEnter = () => {
    if (Number(newHeight) < 1 || Number(newHeight) > 210) {
      setNewHeight(height);
      setAlertState({ id: Date.now(), message: 'invalid-height' });
    } else {
      updateLayer(index, { height: newHeight });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlurOrEnter();
      handleHeightBlurOrEnter();
    }
  };

  return (
    <div
      ref={ref}
      className={selectLayer.name === name ? 'select-layer-card' : 'layer-card'}
      onClick={handleSelectClick}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSelectClick();
      }}
    >
      <div className="layer-info">
        <button className="layer-visible" onClick={handleVisibleClick}>
          {visible ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
        </button>
        <div className="layer-wrapper">
          <div>
            <input
              className="layer-name-input"
              value={newName}
              onClick={(e) => e.stopPropagation()}
              onChange={handleNameChange}
              onBlur={handleNameBlurOrEnter}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div>
            <input
              className="layer-height-input"
              value={newHeight}
              onClick={(e) => e.stopPropagation()}
              onChange={handleHeightChange}
              onBlur={handleHeightBlurOrEnter}
              onKeyDown={handleKeyDown}
            />
            mm
          </div>
        </div>
      </div>
      <div className="layer-icon">
        <button
          className="layer-icon-copy"
          aria-label="layer copy button"
          onClick={handleCopyClick}
        >
          <AiOutlineCopy />
        </button>
        <button
          className="layer-icon-delete"
          aria-label="layer remove button"
          onClick={handleRemoveClick}
        >
          <AiOutlineDelete />
        </button>
      </div>
    </div>
  );
}

export default LayerCard;
