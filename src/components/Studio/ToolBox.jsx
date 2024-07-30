import { useRef } from 'react';

import { PiImage } from 'react-icons/pi';

import useStore from '../../store/store';

function ToolBox({ type, iconList, selectTool, selectedTool }) {
  const { setCameraView, canvasSize } = useStore();
  const fileInputRef = useRef(null);
  const { addLayer, setAlertState } = useStore();

  const handleImageImport = () => {
    fileInputRef.current.click();
  };

  const handleViewChange = (viewId) => {
    selectTool(viewId);

    const { width, height, depth } = canvasSize;
    const distance = Math.max(width, height, depth) * 1.5;

    switch (viewId) {
      case 'viewPerspective':
        setCameraView(
          { x: distance, y: -distance, z: distance },
          { x: 0, y: 0, z: 0 },
        );
        break;
      case 'viewFront':
        setCameraView({ x: 0, y: -distance, z: 0 }, { x: 0, y: 0, z: 0 });
        break;
      case 'viewBack':
        setCameraView({ x: 0, y: distance, z: 0 }, { x: 0, y: 0, z: 0 });
        break;
      case 'viewLeft':
        setCameraView({ x: -distance, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        break;
      case 'viewRight':
        setCameraView({ x: distance, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
        break;
      case 'viewUp':
        setCameraView({ x: 0, y: 0, z: distance }, { x: 0, y: 0, z: 0 });
        break;
      default:
        break;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const layerData = {
            type: 'image',
            name: file.name,
            width: img.width,
            height: img.height,
            x: 0,
            y: 0,
            rotation: 0,
            visible: true,
            opacity: 1,
          };

          addLayer(layerData);

          setTimeout(() => {
            const updatedLayers = useStore.getState().layerList;
            const newLayer = updatedLayers[updatedLayers.length - 1];

            if (newLayer && newLayer.id) {
              try {
                localStorage.setItem(file.name, e.target.result);
              } catch (error) {
                setAlertState('failed-image-import');
              }
            } else {
              setAlertState('failed-image-import');
            }
          }, 0);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="toolbox-container">
      {type === '2d' &&
        iconList.map(({ id, icon: IconComponent }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => selectTool(id)}
          >
            <IconComponent />
          </button>
        ))}
      {type === '2d' && (
        <>
          <div className="divide-tool"></div>
          <button
            className="tool-button"
            aria-label="image-button"
            onClick={handleImageImport}
          >
            <PiImage />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </>
      )}
      {type === '3d' &&
        iconList.map(({ id, icon: IconComponent }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => handleViewChange(id)}
          >
            <IconComponent />
          </button>
        ))}
    </div>
  );
}

export default ToolBox;
