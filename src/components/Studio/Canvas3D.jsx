import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
import { IoCubeOutline } from 'react-icons/io5';

import ToolBox from './ToolBox';
import Layer3D from './Layer3D';
import LayoutGridAxes from './LayoutGridAxes';
import useCameraControl from '../../r3f-utils/useCameraControl';
import useStore from '../../store/store';

function SceneContent() {
  const { scene } = useThree();
  const { setExportToSTL } = useStore();

  const exportToSTL = useCallback(() => {
    const exporter = new STLExporter();
    const exportScene = new THREE.Scene();

    const traverseAndExport = (object) => {
      if (
        object instanceof THREE.Mesh &&
        object.geometry &&
        !(object.parent instanceof THREE.AxesHelper) &&
        object.name !== 'LayoutGridAxes'
      ) {
        const clonedObject = object.clone();
        clonedObject.material = new THREE.MeshStandardMaterial({
          color: object.material.color,
          roughness: 0.7,
          metalness: 0.2,
        });
        exportScene.add(clonedObject);
      }

      object.children.forEach((child) => traverseAndExport(child));
    };

    scene.children.forEach((child) => traverseAndExport(child));

    const stlString = exporter.parse(exportScene);

    const blob = new Blob([stlString], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'scene_without_grid.stl';
    link.click();
  }, [scene]);

  useEffect(() => {
    setExportToSTL(exportToSTL);
  }, [exportToSTL, setExportToSTL]);

  return null;
}

function Canvas3D() {
  const canvasRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useCameraControl();

  const { canvasSize, layerList, viewToolList } = useStore();

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
            position: [0, -canvasSize.height * 1.1, canvasSize.depth * 1.1],
            up: [0, 0, 1],
            fov: 50,
            near: 0.1,
            far:
              Math.max(canvasSize.width, canvasSize.height, canvasSize.depth) *
              10,
          }}
          ref={canvasRef}
          style={{ height: '100%', width: '100%' }}
          background="#ffffff"
        >
          <SceneContent />
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
