import { useRef } from 'react';

import { PiImage } from 'react-icons/pi';

import * as THREE from 'three';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase-config';

import useStore from '../../store/store';

function ToolBox({ type, iconList, selectTool, selectedTool }) {
  const canvasSize = useStore((state) => state.canvasSize);
  const cameraSetting = useStore((state) => state.cameraSetting);
  const setCameraSetting = useStore((state) => state.setCameraSetting);
  const fileInputRef = useRef(null);
  const { addLayer, setAlertState } = useStore();

  const handleImageImport = () => {
    fileInputRef.current.click();
  };

  const handleViewChange = (viewId) => {
    selectTool(viewId);

    const { width, height, depth } = canvasSize;
    const distance = Math.max(width, height, depth) * 1.1;

    let newCameraSetting = {
      enableDamping: false,
      dampingFactor: 0.05,
      zoomSpeed: 2,
    };

    switch (viewId) {
      case 'viewPerspective':
        newCameraSetting = {
          ...newCameraSetting,
          position: new THREE.Vector3(-distance, -distance, distance),
          up: new THREE.Vector3(0, 0, 1),
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      case 'viewFront':
        newCameraSetting = {
          ...newCameraSetting,
          position: new THREE.Vector3(0, -distance * 1.5, 0),
          up: new THREE.Vector3(0, 0, 1),
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      case 'viewBack':
        newCameraSetting = {
          ...newCameraSetting,
          position: new THREE.Vector3(0, distance * 1.5, 0),
          up: new THREE.Vector3(0, 0, 1),
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      case 'viewLeft':
        newCameraSetting = {
          ...newCameraSetting,
          position: new THREE.Vector3(-distance * 1.5, 0, 0),
          up: new THREE.Vector3(0, 0, 1),
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      case 'viewRight':
        newCameraSetting = {
          ...newCameraSetting,
          position: new THREE.Vector3(distance * 1.5, 0, 0),
          up: new THREE.Vector3(0, 0, 1),
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      case 'viewUp':
        newCameraSetting = {
          ...newCameraSetting,
          position: new THREE.Vector3(0, 0, distance * 1.5),
          up: new THREE.Vector3(0, 1, 0),
          target: new THREE.Vector3(0, 0, 0),
        };
        break;
      default:
        break;
    }

    setCameraSetting(newCameraSetting);
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
