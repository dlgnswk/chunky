import React from 'react';
import useStore from '../../store/store';
import FileButton from '../shared/Button/FileButton';

function ButtonArea() {
  const { exportLayersToSTL, saveCurrentWork, saveAsPreset, user } = useStore();

  const handleExportClick = () => {
    exportLayersToSTL();
  };

  const handleSaveClick = async () => {
    await saveCurrentWork();
  };

  const handleSaveAsPresetClick = async () => {
    await saveAsPreset();
  };

  const ADMIN_EMAIL = 'admin@chunky.com';

  const isAdmin = user && user.email === ADMIN_EMAIL;

  return (
    <div className="button-area">
      <FileButton text="Export" onClick={handleExportClick} />
      <FileButton text="Save" onClick={handleSaveClick} />
      {isAdmin && (
        <FileButton text="Preset" onClick={handleSaveAsPresetClick} />
      )}
    </div>
  );
}

export default ButtonArea;
