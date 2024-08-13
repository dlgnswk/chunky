import { useRef } from 'react';

import { PiImage } from 'react-icons/pi';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase-config';

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
    const distance = Math.max(width, height, depth) * 1.1;

    switch (viewId) {
      case 'viewPerspective':
        setCameraView(
          { x: -distance, y: -distance, z: distance },
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 },
        );
        break;
      case 'viewFront':
        setCameraView(
          { x: 0, y: -distance, z: 0 },
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 },
        );
        break;
      case 'viewBack':
        setCameraView(
          { x: 0, y: distance, z: 0 },
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 },
        );
        break;
      case 'viewLeft':
        setCameraView(
          { x: -distance, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 },
        );
        break;
      case 'viewRight':
        setCameraView(
          { x: distance, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 0, z: 1 },
        );
        break;
      case 'viewUp':
        setCameraView(
          { x: 0, y: 0, z: distance },
          { x: 0, y: 0, z: 0 },
          { x: 0, y: 1, z: 0 },
        );
        break;
      default:
        break;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const storageRef = ref(storage, `images/${file.name}`);
        await uploadBytes(storageRef, file);

        const downloadURL = await getDownloadURL(storageRef);

        const img = new Image();
        img.src = downloadURL;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const maxSize = 300;
        let { width } = img;
        let { height } = img;

        if (width > height && width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        } else if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }

        const newLayer = {
          type: 'image',
          name: file.name,
          imageUrl: downloadURL,
          width: Math.round(width),
          height: Math.round(height),
          x: 0,
          y: 0,
          rotation: 0,
          visible: true,
          opacity: 1,
        };

        addLayer(newLayer);
      } catch (error) {
        setAlertState('failed-image-import');
      }
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
        iconList.map(({ id, icon }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => handleViewChange(id)}
          >
            <img src={icon} alt="view icon" />
          </button>
        ))}
    </div>
  );
}

export default ToolBox;
