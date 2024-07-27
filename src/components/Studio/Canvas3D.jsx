import { useRef, useState } from 'react';
import {
  OrbitControls,
  Environment,
  AccumulativeShadows,
} from '@react-three/drei';
import { Canvas, extend } from '@react-three/fiber';
import {
  EffectComposer,
  SSAO,
  Bloom,
  ToneMapping,
} from '@react-three/postprocessing';
import { IoCubeOutline } from 'react-icons/io5';

import * as THREE from 'three';
import { GridHelper, AxesHelper } from 'three';

import ToolBox from './ToolBox';
import Layer3D from './Layer3D';
import LayoutGridAxes from './LayoutGridAxes';
import useCameraControl from '../../r3f-utils/useCameraControl';

import useStore from '../../store/store';

extend({ GridHelper, AxesHelper, EffectComposer, SSAO, Bloom, ToneMapping });

function Canvas3D() {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useCameraControl();
  const { canvasSize } = useStore();

  const { layerList, viewToolList } = useStore();
  const [selectedTool, setSelectedTool] = useState('viewPerspective');

  const selectTool = (tool) => {
    setSelectedTool((prevTool) => (prevTool === tool ? null : tool));
  };

  return (
    <div className="canvas-3d">
      <ToolBox
        type="3d"
        iconList={viewToolList}
        selectTool={selectTool}
        selectedTool={selectedTool}
      />
      {layerList.length === 0 ? (
        <div className="default-logo">
          <IoCubeOutline />
        </div>
      ) : (
        <Canvas
          shadows
          gl={{
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
          }}
          camera={{
            position: [0, -canvasSize.height * 1.5, canvasSize.depth * 1.5],
            up: [0, 0, 1],
            fov: 45,
            near: 0.1,
            far:
              Math.max(canvasSize.width, canvasSize.height, canvasSize.depth) *
              10,
          }}
          ref={canvasRef}
          style={{ height: '100%', width: '100%' }}
          background="#ffffff"
        >
          <EffectComposer multisampling={0} enableNormalPass>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
            />
          </EffectComposer>
          <ambientLight intensity={1} />
          <directionalLight position={[2, 3, 5]} intensity={1} castShadow />
          <Environment preset="city" />
          <AccumulativeShadows />
          <OrbitControls
            ref={cameraRef}
            makeDefault
            enableDamping={false}
            zoomSpeed={2}
            target={[0, 0, 0]}
            up={[0, 0, 1]}
          />
          <group ref={sceneRef}>
            <LayoutGridAxes />
            {layerList.map(
              (layer) =>
                layer.visible && (
                  <Layer3D
                    key={layer.id}
                    layer={layer}
                    zPosition={layer.zIndex}
                    thickness={layer.height}
                    renderOrder={1}
                  />
                ),
            )}
          </group>
        </Canvas>
      )}
    </div>
  );
}

export default Canvas3D;
