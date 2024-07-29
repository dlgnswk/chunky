import React from 'react';
import { CiExport, CiImport } from 'react-icons/ci';
import useStore from '../../../store/store';

function FileButton({ text }) {
  const { setAlertState, layerList, exportToSTL, saveCurrentWork } = useStore();

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
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
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
      <div className="file-icon">
        {text === 'Save' ? <CiImport /> : <CiExport />}
      </div>
      <div className="file-action">{text}</div>
    </div>
  );
}

export default FileButton;
