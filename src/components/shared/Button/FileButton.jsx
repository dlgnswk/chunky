import React from 'react';
import { CiExport, CiImport, CiSaveDown2 } from 'react-icons/ci';
import useStore from '../../../store/store';

function FileButton({ text }) {
  const {
    setAlertState,
    layerList,
    exportToSTL,
    saveCurrentWork,
    saveAsPreset,
  } = useStore();

  const handleClick = async () => {
    if (text === 'Export') {
      try {
        exportToSTL();
        setAlertState('success-export');
      } catch (error) {
        setAlertState('failed-export');
      }
    } else if (text === 'Save') {
      try {
        await saveCurrentWork();
        setAlertState('success-save');
      } catch (error) {
        if (error.message === 'LayerSet already exists') {
          setAlertState('layer-set-exists');
        } else {
          setAlertState('failed-save');
        }
      }
    } else if (text === 'Preset') {
      try {
        await saveAsPreset();
        setAlertState('success-save-preset');
      } catch (error) {
        if (error.message === 'Preset already exists') {
          setAlertState('failed-save-preset');
        } else {
          setAlertState('failed-save-preset');
        }
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  };

  const getIcon = () => {
    switch (text) {
      case 'Save':
        return <CiImport />;
      case 'Export':
        return <CiExport />;
      case 'Preset':
        return <CiSaveDown2 />;
      default:
        return null;
    }
  };

  return (
    <div
      className={
        layerList.length === 0 ? 'file-container' : 'able-file-container'
      }
      onClick={handleClick}
      onKeyDown={handleKeyPress}
      role="button"
      tabIndex={0}
    >
      <div className="file-icon">{getIcon()}</div>
      <div className="file-action">{text}</div>
    </div>
  );
}

export default FileButton;
