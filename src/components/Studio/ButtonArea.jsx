import React from 'react';
import useStore from '../../store/store';
import FileButton from '../shared/Button/FileButton';

function ButtonArea() {
  const { exportLayersToSTL, saveCurrentWork } = useStore();

  const handleExportClick = () => {
    exportLayersToSTL();
  };

  const handleSaveClick = async () => {
    await saveCurrentWork();
  };

  return (
    <div className="button-area">
      <FileButton text="Export" onClick={handleExportClick} />
      <FileButton text="Save" onClick={handleSaveClick} />
    </div>
  );
}

export default ButtonArea;
