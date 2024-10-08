import { useRef } from 'react';

import { PiImage } from 'react-icons/pi';

import * as THREE from 'three';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase-config';

import useStore from '../../store/store';

function ToolBox({ type, iconList, selectTool, selectedTool }) {
  const canvasSize = useStore((state) => state.canvasSize);
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
    const newCameraSetting = {
      enableDamping: false,
      dampingFactor: 0.05,
      zoomSpeed: 2,
    };

    switch (viewId) {
      case 'viewPerspective':
        newCameraSetting.position = new THREE.Vector3(
          -distance,
          -distance,
          distance * 1.25,
        );
        newCameraSetting.up = new THREE.Vector3(0, 0, 1);
        newCameraSetting.target = new THREE.Vector3(0, 0, 0);
        break;
      case 'viewFront':
        newCameraSetting.position = new THREE.Vector3(0, -distance * 1.5, 0);
        newCameraSetting.up = new THREE.Vector3(0, 0, 1);
        newCameraSetting.target = new THREE.Vector3(0, 0, 0);
        break;
      case 'viewBack':
        newCameraSetting.position = new THREE.Vector3(0, distance * 1.5, 0);
        newCameraSetting.up = new THREE.Vector3(0, 0, 1);
        newCameraSetting.target = new THREE.Vector3(0, 0, 0);
        break;
      case 'viewLeft':
        newCameraSetting.position = new THREE.Vector3(-distance * 1.5, 0, 0);
        newCameraSetting.up = new THREE.Vector3(0, 0, 1);
        newCameraSetting.target = new THREE.Vector3(0, 0, 0);
        break;
      case 'viewRight':
        newCameraSetting.position = new THREE.Vector3(distance * 1.5, 0, 0);
        newCameraSetting.up = new THREE.Vector3(0, 0, 1);
        newCameraSetting.target = new THREE.Vector3(0, 0, 0);
        break;
      case 'viewUp':
        newCameraSetting.position = new THREE.Vector3(0, 0, distance * 1.5);
        newCameraSetting.up = new THREE.Vector3(0, 1, 0);
        newCameraSetting.target = new THREE.Vector3(0, 0, 0);
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
        iconList.map(({ id, icon: IconComponent, label }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => selectTool(id)}
            data-tooltip={label}
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
            data-tooltip="이미지 불러오기"
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
        iconList.map(({ id, icon, label }) => (
          <button
            className={`tool-button ${selectedTool === id ? 'selected' : ''}`}
            key={id}
            aria-label={id}
            onClick={() => handleViewChange(id)}
            data-tooltip={label}
          >
            <img src={icon} alt="view icon" />
          </button>
        ))}
    </div>
  );
}

export default ToolBox;
