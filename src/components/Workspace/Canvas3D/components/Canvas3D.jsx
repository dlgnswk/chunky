import React, { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  ToneMapping,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import * as THREE from 'three';

import { IoCubeOutline } from 'react-icons/io5';

import ToolBox from '../../ToolBox';
import Layer3D from '../../Layer3D';
import useCameraControl from '../hooks/useCameraControl';
import useStore from '../../../../store/store';
import GridWithAxes from './GridWithAxes';

function Canvas3D() {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useCameraControl();

  const canvasSize = useStore((state) => state.canvasSize);
  const layerList = useStore((state) => state.layerList);
  const viewToolList = useStore((state) => state.viewToolList);

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
          <IoCubeOutline aria-label="cube-outline-icon" />
        </div>
      ) : (
        <Canvas
          shadows
          camera={{
            position: [-100, -canvasSize.height * 1.1, canvasSize.depth * 1.1],
            up: [0, 0, 1],
            fov: 40,
            near: 0.1,
            far:
              Math.max(canvasSize.width, canvasSize.height, canvasSize.depth) *
              10,
          }}
          ref={canvasRef}
          style={{ height: '100%', width: '100%' }}
          background="#ffffff"
        >
          <ToneMapping
            blendFunction={BlendFunction.NORMAL}
            adaptive
            resolution={256}
            middleGrey={0.6}
            maxLuminance={16.0}
            averageLuminance={1.0}
            adaptationRate={1.0}
          />
          <EffectComposer disableNormalPass enabled>
            <Bloom
              intensity={0.9}
              luminanceThreshold={1}
              luminanceSmoothing={4}
            />
          </EffectComposer>
          <ambientLight color="#ffffff" intensity={1} />
          <directionalLight
            position={[3000, -1000, 5000]}
            target-position={[0, 0, 0]}
            intensity={1.1}
            color={0xffffff}
            castShadow
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-camera-left={-6}
            shadow-camera-right={6}
          />
          <Environment preset="city" />
          <OrbitControls
            ref={cameraRef}
            makeDefault
            enableDamping={false}
            zoomSpeed={2}
            target={[0, 0, 0]}
            up={[0, 0, 1]}
            mouseButtons={{
              LEFT: THREE.MOUSE.ROTATE,
              MIDDLE: THREE.MOUSE.PAN,
            }}
          />
          <group ref={sceneRef}>
            <GridWithAxes />
            {Array.isArray(layerList) &&
              layerList.map(
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
