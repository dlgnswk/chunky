import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCopy,
  AiOutlineDelete,
} from 'react-icons/ai';
import { useState, useEffect } from 'react';
import useStore from '../../store/store';
import firestore from '../../services/firestore';

function LayerCard({
  name,
  index,
  height,
  visible,
  selectLayer,
  handleSelectClick,
}) {
  const { updateLayer, removeLayer, setAlertState, user, updateLayerHeight } =
    useStore();
  const [newName, setNewName] = useState(name);
  const [newHeight, setNewHeight] = useState(height);

  useEffect(() => {
    setNewName(name);
    setNewHeight(height);
  }, [name, height]);

  const handleVisibleClick = (e) => {
    e.stopPropagation();
    updateLayer(index, { visible: !visible });
  };

  const handleRemoveClick = () => {
    removeLayer(index);
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleNameBlur = () => {
    if (newName.trim() === '') {
      setNewName(name);
      return;
    }

    if (
      useStore
        .getState()
        .layerList.some(
          (layer) => layer.name === newName && layer.index !== index,
        )
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

  const handleHeightBlur = async () => {
    const heightValue = Number(newHeight);
    if (heightValue < 1 || heightValue > 827) {
      setNewHeight(height);
      setAlertState({ id: Date.now(), message: 'invalid-height' });
    } else {
      try {
        await firestore.updateLayerHeight(user.uid, index, heightValue);
        setNewHeight(heightValue);
      } catch (error) {
        setAlertState({ id: Date.now(), message: 'update-failed' });
        setNewHeight(height);
      }
    }
  };

  return (
    <div
      className={
        selectLayer && selectLayer.name === name
          ? 'select-layer-card'
          : 'layer-card'
      }
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
              onBlur={handleNameBlur}
            />
          </div>
          <div>
            <input
              className="layer-height-input"
              value={newHeight}
              onClick={(e) => e.stopPropagation()}
              onChange={handleHeightChange}
              onBlur={handleHeightBlur}
            />
            mm
          </div>
        </div>
      </div>
      <div className="layer-icon">
        <button
          className="layer-icon-copy"
          aria-label="layer copy button"
          onClick={() => {
            /* 복사 로직 */
          }}
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
