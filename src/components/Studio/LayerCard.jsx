import { useState, useEffect, useCallback } from 'react';

import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineCopy,
  AiOutlineDelete,
  AiOutlineCheck,
} from 'react-icons/ai';

import { debounce } from 'lodash';

import useStore from '../../store/store';

function LayerCard({
  layer,
  name,
  index,
  height,
  zIndex,
  visible,
  fill,
  selectLayer,
  handleSelectClick,
}) {
  const { updateLayer, removeLayer, setAlertState, updateLayerInFirestore } =
    useStore();

  const [newName, setNewName] = useState(name);
  const [newHeight, setNewHeight] = useState(height);
  const [newZIndex, setNewZIndex] = useState(zIndex);
  const [newFill, setNewFill] = useState(fill);

  useEffect(() => {
    setNewName(name);
    setNewHeight(height);
    setNewZIndex(zIndex);
    setNewFill(fill);
  }, [name, height, zIndex, fill]);

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

  const handleHeightChange = (e) => {
    setNewHeight(e.target.value);
  };

  const handleZIndexChange = (e) => {
    setNewZIndex(e.target.value);
  };

  const handleFillChange = (e) => {
    setNewFill(e.target.value);
  };

  const debouncedUpdateLayer = useCallback(
    debounce(async (updatedLayer) => {
      try {
        const success = await updateLayerInFirestore(updatedLayer);
        if (!success) {
          setAlertState({ id: Date.now(), message: 'update-failed' });

          setNewName(name);
          setNewHeight(height);
          setNewZIndex(zIndex);
          setNewFill(fill);
        }
      } catch (error) {
        setAlertState({ id: Date.now(), message: 'update-failed' });

        setNewName(name);
        setNewHeight(height);
        setNewZIndex(zIndex);
        setNewFill(fill);
      }
    }, 500),
    [updateLayerInFirestore, setAlertState, name, height, zIndex, fill],
  );

  const handleSaveLayer = useCallback(() => {
    const updatedLayer = { ...layer };
    let hasChanges = false;

    if (newName !== name && newName.trim() !== '') {
      updatedLayer.name = newName;
      hasChanges = true;
    }

    if (Number(newHeight) !== height) {
      updatedLayer.height = Number(newHeight);
      hasChanges = true;
    }

    if (Number(newZIndex) !== zIndex) {
      updatedLayer.zIndex = Number(newZIndex);
      hasChanges = true;
    }

    if (newFill !== fill) {
      updatedLayer.fill = newFill;
      hasChanges = true;
    }

    if (hasChanges) {
      debouncedUpdateLayer(updatedLayer);
    }
  }, [
    layer,
    newName,
    newHeight,
    newZIndex,
    newFill,
    name,
    height,
    zIndex,
    fill,
    debouncedUpdateLayer,
  ]);

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
            <span className="input-label"># </span>
            <input
              className="layer-name-input"
              value={newName}
              onClick={(e) => e.stopPropagation()}
              onChange={handleNameChange}
            />
          </div>
          <div>
            <span className="input-label">h </span>
            <input
              className="layer-height-input"
              value={newHeight}
              onClick={(e) => e.stopPropagation()}
              onChange={handleHeightChange}
            />
            <span className="units">mm</span>
          </div>
          <div>
            <span className="input-label">z </span>
            <input
              className="layer-z-Index-input"
              value={newZIndex}
              onClick={(e) => e.stopPropagation()}
              onChange={handleZIndexChange}
            />
            <span className="units">mm</span>
          </div>
        </div>
      </div>
      <div className="layer-icon">
        <div className="layer-icon-box">
          <input
            type="color"
            className="layer-fill-input"
            value={newFill}
            onClick={(e) => e.stopPropagation()}
            onChange={handleFillChange}
          />
          <span className="layer-fill-label">{newFill}</span>
        </div>
        <div className="layer-icon-box">
          <button
            className="layer-icon-save"
            aria-label="layer save button"
            onClick={handleSaveLayer}
          >
            <AiOutlineCheck />
          </button>
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
    </div>
  );
}

export default LayerCard;
