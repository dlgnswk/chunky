import { create } from 'zustand';

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

  setIsModalOpened: (isOpen) => set({ isModalOpened: isOpen }),
  setAlertState: (alert) => set({ alertState: [alert] }),
  removeAlert: (id) =>
    set((state) => ({
      alertState: state.alertState.filter((alert) => alert.id !== id),
    })),
  setModalType: (type) => set({ modalType: type }),

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
