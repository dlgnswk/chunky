import { forwardRef } from 'react';

import { OrbitControls } from '@react-three/drei';

import useStore from '../../../store/store';

const CameraControl = forwardRef(function CameraControl(props, ref) {
  const cameraSetting = useStore((state) => state.cameraSetting);

  return <OrbitControls ref={ref} {...cameraSetting} {...props} />;
});

export default CameraControl;
