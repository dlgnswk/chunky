import { IoCubeOutline } from 'react-icons/io5';
import { useRef, useState } from 'react';

import { OrbitControls, Environment, Grid } from '@react-three/drei';
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
import Axis3D from './Axis3D';
import useCameraControl from '../../r3f-utils/useCameraControl';

extend({ GridHelper, AxesHelper, EffectComposer, SSAO, Bloom, ToneMapping });

function Canvas3D() {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useCameraControl();

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
            position: [40, 40, 15],
            up: [0, 0, 1],
            fov: 30,
            near: 0.1,
            far: 5000,
          }}
          ref={canvasRef}
          style={{ height: '100%', width: '100%' }}
          background="#292733"
        >
          <EffectComposer multisampling={0} enableNormalPass>
            <Bloom
              intensity={0.5}
              luminanceThreshold={0.5}
              luminanceSmoothing={0.5}
            />
            {/* <SSAO
              radius={0.1}
              intensity={150}
              luminanceInfluence={0.1}
              color="black"
            /> */}
          </EffectComposer>
          <ambientLight intensity={0.6} />
          <Environment preset="city" />
          <OrbitControls
            ref={cameraRef}
            makeDefault
            enableDamping={false}
            zoomSpeed={2}
          />
          <group ref={sceneRef}>
            <Axis3D size={100} thickness={0.5} />
            <Grid
              args={[1000, 1000]}
              rotation={[Math.PI / 2, 0, 0]}
              cellSize={10}
              cellThickness={2}
              sectionSize={10}
              sectionThickness={1}
              fadeDistance={5000}
              cellColor="#AAAAAA"
              sectionColor="#AAAAAA"
              fadeStrength={1.5}
              opacity={0.8}
              side={THREE.DoubleSide}
              infiniteGrid
              renderOrder={-1}
            />
            {layerList.map(
              (layer) =>
                layer.visible && (
                  <Layer3D
                    key={layer.id}
                    layer={layer}
                    zPosition={20}
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
