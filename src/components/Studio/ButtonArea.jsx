import React from 'react';
import useStore from '../../store/store';
import FileButton from '../shared/Button/FileButton';

function ButtonArea() {
  const { exportLayersToSTL } = useStore();

  const handleExportClick = () => {
    exportLayersToSTL();
  };

  return (
    <div className="button-area">
      <FileButton text="Save" onClick={() => console.log('Save clicked')} />
      <FileButton text="Export" onClick={handleExportClick} />
    </div>
  );
}

export default ButtonArea;
