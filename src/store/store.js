import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  PiHandWaving,
  PiLineSegment,
  PiBezierCurve,
  PiRectangle,
  PiTriangle,
  PiCircle,
  PiPaintBucket,
  PiEraser,
  PiImage,
} from 'react-icons/pi';
import handleAuthError from '../utils/authError';
import { auth, onAuthStateChanged } from '../services/firebase-config';
import firestore from '../services/firestore';

import ViewBackIcon from '../components/shared/Icon/ViewBackIcon';
import ViewFrontIcon from '../components/shared/Icon/ViewFrontIcon';
import ViewLeftIcon from '../components/shared/Icon/ViewLeftIcon';
import ViewRightIcon from '../components/shared/Icon/ViewRightIcon';
import ViewUpIcon from '../components/shared/Icon/ViewUpIcon';
import ViewPerspectiveIcon from '../components/shared/Icon/ViewPerspectiveIcon';

const DRAWING_ICON_LIST = [
  { id: 'move', icon: PiHandWaving },
  { id: 'line', icon: PiLineSegment },
  { id: 'bezier', icon: PiBezierCurve },
  { id: 'rectangle', icon: PiRectangle },
  { id: 'triangle', icon: PiTriangle },
  { id: 'circle', icon: PiCircle },
  { id: 'paintBucket', icon: PiPaintBucket },
  { id: 'eraser', icon: PiEraser },
  { id: 'image', icon: PiImage },
];

const VIEW_ICON_LIST = [
  { id: 'viewPerspective', icon: ViewPerspectiveIcon },
  { id: 'viewBack', icon: ViewBackIcon },
  { id: 'viewFront', icon: ViewFrontIcon },
  { id: 'viewLeft', icon: ViewLeftIcon },
  { id: 'viewRight', icon: ViewRightIcon },
  { id: 'viewUp', icon: ViewUpIcon },
];

const INITIAL_LAYER_LIST = [];
const INITIAL_CANVAS_SIZE = { width: 827, height: 827, depth: 827 };

const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  isModalOpened: false,
  alertState: [],
  modalType: '',
  nextLayerIndex: INITIAL_LAYER_LIST.length,
  selectedLayer: null,
  drawingToolList: DRAWING_ICON_LIST,
  viewToolList: VIEW_ICON_LIST,
  canvasSize: INITIAL_CANVAS_SIZE,
  layerList: [],

  setSelectedLayer(layer) {
    set({ selectedLayer: layer });
  },

  initializeLayerListener: (userId) => {
    const unsubscribe = firestore.subscribeToLayers(userId, (layers) => {
      set((state) => {
        const mergedLayers = layers.map((newLayer) => {
          const existingLayer = state.layerList.find(
            (l) => l.id === newLayer.id,
          );
          return existingLayer ? { ...existingLayer, ...newLayer } : newLayer;
        });
        return { layerList: mergedLayers };
      });
    });
    return unsubscribe;
  },

  addPathToLayer: async (layerIndex, newPath) => {
    const { layerList, updateLayerInFirestore } = get();
    const layer = layerList.find((l) => l.index === layerIndex);
    if (layer) {
      const updatedLayer = {
        ...layer,
        path: [...layer.path, { ...newPath, fill: 'none' }],
      };
      await updateLayerInFirestore(updatedLayer);
    }
  },

  updatePathInLayer: async (layerIndex, pathIndex, updates) => {
    const { user, layerList } = get();
    const layer = layerList.find((l) => l.index === layerIndex);
    if (layer) {
      const updatedPath = layer.path.map((p, idx) =>
        idx === pathIndex ? { ...p, ...updates } : p,
      );
      const updatedLayer = { ...layer, path: updatedPath };
      await firestore.updateLayerInFirestoreDB(user.uid, updatedLayer);
    }
  },

  setLayerList: (newLayerList) => {
    set(() => {
      return { layerList: newLayerList };
    });
  },

  setUser(user) {
    set({ user });
  },
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const { user } = userCredential;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      handleAuthError(error, set);
    }
  },
  async registerUser(email, password, userName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const { user } = userCredential;
      await updateProfile(user, { displayName: userName });
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch (error) {
      handleAuthError(error, set);
      throw error;
    }
  },
  async logout() {
    try {
      await auth.signOut();
      localStorage.removeItem('user');
      set({ user: null });
    } catch (error) {
      set((state) => ({
        alertState: [
          ...state.alertState,
          { id: uuidv4(), message: 'failed-logout' },
        ],
      }));
    }
  },

  setIsModalOpened(isOpen) {
    set({ isModalOpened: isOpen });
  },
  setAlertState(message) {
    set((state) => ({
      alertState: [...state.alertState, { id: uuidv4(), message }],
    }));
  },
  removeAlert(id) {
    set((state) => ({
      alertState: state.alertState.filter((alert) => alert.id !== id),
    }));
  },
  setModalType(type) {
    set({ modalType: type });
  },

  setDrawingToolList(drawingTool) {
    set({ drawingToolList: drawingTool });
  },
  setViewToolList(viewTool) {
    set({ viewToolList: viewTool });
  },

  setCanvasSize(width, height, depth) {
    set({ canvasSize: { width, height, depth } });
  },

  async loadLayers() {
    const { uid } = useStore.getState().user;
    const layers = await firestore.getLayersFromFirestore(uid);
    set({ layerList: layers });
  },

  async addLayer() {
    const { uid } = useStore.getState().user;
    const currentLayers = useStore.getState().layerList;
    const maxIndex =
      currentLayers.length > 0
        ? Math.max(...currentLayers.map((layer) => layer.index))
        : 0;
    const newIndex = maxIndex + 1;
    const newLayer = {
      index: newIndex,
      name: `layer${newIndex}`,
      height: 1,
      visible: true,
      path: [],
      fill: null,
    };
    const id = await firestore.addLayerToFirestore(uid, newLayer);
    if (id) {
      newLayer.id = id;
      set((state) => ({
        layerList: [...state.layerList, newLayer],
        nextLayerIndex: state.nextLayerIndex + 1,
        selectedLayer: newLayer,
      }));
    }
  },

  updateLayer(index, updatedProperties) {
    set((state) => {
      const updatedLayerList = state.layerList.map((layer) =>
        layer.index === index ? { ...layer, ...updatedProperties } : layer,
      );
      return { layerList: updatedLayerList };
    });
  },

  updateLayerList: (updatedLayer) => {
    return new Promise((resolve) => {
      set((state) => {
        const newLayerList = state.layerList.map((layer) =>
          layer.id === updatedLayer.id ? updatedLayer : layer,
        );
        resolve(newLayerList);
        return { layerList: newLayerList };
      });
    });
  },

  updateLayerInFirestore: async (layer) => {
    try {
      const { uid } = get().user;
      if (!layer || typeof layer !== 'object' || !layer.id) {
        return false;
      }

      const success = await firestore.updateLayerInFirestoreDB(uid, layer);
      if (success) {
        set((state) => ({
          layerList: state.layerList.map((l) =>
            l.id === layer.id ? { ...l, ...layer } : l,
          ),
        }));
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  },

  async removeLayer(index) {
    const { uid } = useStore.getState().user;
    set((state) => {
      const layerToRemove = state.layerList.find(
        (layer) => layer.index === index,
      );
      if (layerToRemove && layerToRemove.id) {
        firestore.deleteLayerFromFirestore(uid, layerToRemove.id);
      }
      const updatedLayerList = state.layerList.filter(
        (layer) => layer.index !== index,
      );
      return {
        layerList: updatedLayerList,
        selectedLayer: updatedLayerList.length > 0 ? updatedLayerList[0] : null,
      };
    });
  },

  refreshLayerState: async () => {
    const { uid } = get().user;
    const layers = await firestore.getLayersFromFirestore(uid);
    set({ layerList: layers });
  },

  removePathFromLayer: async (index, updatedPaths) => {
    const { user, layerList } = get();
    const layer = layerList.find((l) => l.index === index);
    if (layer) {
      const updatedLayer = { ...layer, path: updatedPaths };
      await firestore.updateLayerInFirestoreDB(user.uid, updatedLayer);
    }
  },
}));

onAuthStateChanged(auth, (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
    useStore.setState({ user });
  } else {
    localStorage.removeItem('user');
    useStore.setState({ user: null });
  }
});

export default useStore;
