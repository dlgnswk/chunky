import { create } from 'zustand';
import {
  PiHandWaving,
  PiLineSegment,
  PiBezierCurve,
  PiRectangle,
  PiTriangle,
  PiCircle,
  PiEraser,
  PiImage,
} from 'react-icons/pi';

import ViewBackIcon from '../components/shared/Icon/ViewBackIcon';
import ViewFrontIcon from '../components/shared/Icon/viewFrontIcon';
import ViewLeftIcon from '../components/shared/Icon/viewLeftIcon';
import ViewRightIcon from '../components/shared/Icon/viewRightIcon';
import ViewUpIcon from '../components/shared/Icon/viewUpIcon';
import ViewPerspectiveIcon from '../components/shared/Icon/viewPerspectiveIcon';

const drawingIconList = [
  { id: 'move', icon: PiHandWaving },
  { id: 'line', icon: PiLineSegment },
  { id: 'bezier', icon: PiBezierCurve },
  { id: 'rectangle', icon: PiRectangle },
  { id: 'triangle', icon: PiTriangle },
  { id: 'circle', icon: PiCircle },
  { id: 'eraser', icon: PiEraser },
  { id: 'image', icon: PiImage },
];

const viewIconList = [
  { id: 'viewBack', icon: ViewBackIcon },
  { id: 'viewFront', icon: ViewFrontIcon },
  { id: 'viewLeft', icon: ViewLeftIcon },
  { id: 'viewRight', icon: ViewRightIcon },
  { id: 'viewUp', icon: ViewUpIcon },
  { id: 'viewPerspective', icon: ViewPerspectiveIcon },
];

const initialLayerList = [];

const findEmptyIndex = (layerList) => {
  for (let i = 0; i < 100; i += 1) {
    const index = String(i).padStart(2, '0');

    if (!layerList.some((layer) => layer.index === index)) {
      return index;
    }
  }

  return String(layerList.length).padStart(2, '0');
};

const useStore = create((set) => ({
  isModalOpened: false,
  alertState: [],
  modalType: '',
  layerList: initialLayerList,
  nextLayerIndex: initialLayerList.length,
  drawingToolList: drawingIconList,
  viewToolList: viewIconList,
  canvasSize: { width: 210, height: 210, depth: 210 },

  setIsModalOpened: (isOpen) => set({ isModalOpened: isOpen }),
  setAlertState: (alert) => set({ alertState: [alert] }),
  removeAlert: (id) =>
    set((state) => ({
      alertState: state.alertState.filter((alert) => alert.id !== id),
    })),
  setModalType: (type) => set({ modalType: type }),
  setDrawingToolList: (drawingTool) => set({ drawingToolList: drawingTool }),
  setViewToolList: (viewTool) => set({ viewToolList: viewTool }),
  setCanvasSize: (width, height, depth) =>
    set({ canvasSize: { width, height, depth } }),

  addLayer: () =>
    set((state) => {
      const index = findEmptyIndex(state.layerList);
      const newLayer = {
        index,
        name: `layer${index}`,
        height: 1,
        visible: true,
      };
      return {
        layerList: [newLayer, ...state.layerList],
        nextLayerIndex: state.nextLayerIndex + 1,
      };
    }),

  copyLayer: (index) =>
    set((state) => {
      const layerToCopy = state.layerList.find(
        (layer) => layer.index === index,
      );
      if (!layerToCopy) return state;

      const newIndex = findEmptyIndex(state.layerList);
      const newLayer = {
        ...layerToCopy,
        index: newIndex,
        name: `layer${newIndex}`,
      };

      return {
        layerList: [newLayer, ...state.layerList],
        nextLayerIndex: state.nextLayerIndex + 1,
      };
    }),

  updateLayer: (index, updatedProperties) =>
    set((state) => ({
      layerList: state.layerList.map((layer) =>
        layer.index === index ? { ...layer, ...updatedProperties } : layer,
      ),
    })),

  removeLayer: (index) =>
    set((state) => ({
      layerList: state.layerList.filter((layer) => layer.index !== index),
    })),

  setLayerList: (newList) => set({ layerList: newList }),
}));

export default useStore;
