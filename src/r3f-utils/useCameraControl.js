import { useEffect, useRef } from 'react';
import * as THREE from 'three';

function useCameraControl(zoomSpeed = 1.5) {
  const controlsRef = useRef();

  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };

      controls.enableKeys = false;
      controls.enablePan = false;

      controls.zoomSpeed = zoomSpeed;

      controls.enableDamping = true;
      controls.dampingFactor = 0.2;
    }
    return undefined;
  }, [zoomSpeed]);

  return controlsRef;
}

export default useCameraControl;
