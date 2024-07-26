import { IoCubeOutline } from 'react-icons/io5';
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

import * as THREE from 'three';
import { GridHelper, AxesHelper } from 'three';

import useStore from '../../store/store';

import ToolBox from './ToolBox';
import Layer3D from './Layer3D';
import LayoutGridAxes from './LayoutGridAxes';
import useCameraControl from '../../r3f-utils/useCameraControl';

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
            position: [
              canvasSize.width * 1.5,
              canvasSize.height * 1.5,
              canvasSize.depth * 1.5,
            ],
            up: [0, 0, 1], // Z축을 위로 설정
            fov: 45,
            near: 0.1,
            far:
              Math.max(canvasSize.width, canvasSize.height, canvasSize.depth) *
              10,
          }}
          ref={canvasRef}
          style={{ height: '100%', width: '100%' }}
          background="#ffffff" // 배경색을 흰색으로 변경
        >
          <EffectComposer multisampling={0} enableNormalPass>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
            />
            {/* <SSAO
              radius={0.5}
              intensity={150}
              luminanceInfluence={0.1}
              color="black"
            /> */}
          </EffectComposer>
          <ambientLight intensity={0.8} />
          <directionalLight position={[2, 3, 5]} intensity={0.8} castShadow />
          <Environment preset="city" />
          <AccumulativeShadows />
          <OrbitControls
            ref={cameraRef}
            makeDefault
            enableDamping={false}
            zoomSpeed={2}
            target={[0, 0, 0]} // 카메라가 바라보는 지점을 원점으로 설정
            up={[0, 0, 1]} // Z축을 위로 설정
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
