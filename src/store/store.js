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
} from 'react-icons/pi';

import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import handleAuthError from '../utils/handleAuthError';
import { auth, db, onAuthStateChanged } from '../services/firebase-config';
import firestore from '../services/firestore';

const DRAWING_ICON_LIST = [
  { id: 'move', icon: PiHandWaving },
  { id: 'line', icon: PiLineSegment },
  { id: 'bezier', icon: PiBezierCurve },
  { id: 'rectangle', icon: PiRectangle },
  { id: 'triangle', icon: PiTriangle },
  { id: 'circle', icon: PiCircle },
  { id: 'paintBucket', icon: PiPaintBucket },
  { id: 'eraser', icon: PiEraser },
];

const VIEW_ICON_LIST = [
  { id: 'viewPerspective', icon: 'images/viewPerspective.svg' },
  { id: 'viewBack', icon: 'images/viewBack.svg' },
  { id: 'viewFront', icon: 'images/viewFront.svg' },
  { id: 'viewLeft', icon: 'images/viewLeft.svg' },
  { id: 'viewRight', icon: 'images/viewRight.svg' },
  { id: 'viewUp', icon: 'images/viewUp.svg' },
];

const INITIAL_LAYER_LIST = [];
const INITIAL_CANVAS_SIZE = { width: 180, height: 180, depth: 180 };

const useStore = create((set, get) => ({
  user: null,
  isModalOpened: false,
  alertState: [],
  modalType: '',
  nextLayerIndex: INITIAL_LAYER_LIST.length,
  selectedLayer: null,
  drawingToolList: DRAWING_ICON_LIST,
  viewToolList: VIEW_ICON_LIST,
  canvasSize: INITIAL_CANVAS_SIZE,
  layerList: [],
  exportToSTL: null,
  layerTitle: 'Layer Title',
  cameraPosition: { x: 0, y: -180 * 1.1, z: 180 * 1.1 },
  cameraTarget: { x: 0, y: 0, z: 0 },
  cameraUp: { x: 0, y: 0, z: 1 },

  setCameraView: (position, target, up) =>
    set({
      cameraPosition: position,
      cameraTarget: target,
      cameraUp: up,
    }),

  setLayerTitle: async (title) => {
    set({ layerTitle: title });
    const { user } = get();
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), { layerTitle: title });
    }
  },

  loadLayerTitle: async () => {
    const { user } = get();
    if (user) {
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        set({ layerTitle: docSnap.data().layerTitle || 'Untitled' });
      }
    }
  },

  setExportToSTL: (func) => set({ exportToSTL: func }),

  saveCurrentWork: async () => {
    const { user, layerList, layerTitle } = get();

    if (!user) {
      set((state) => ({
        alertState: [
          ...state.alertState,
          { id: uuidv4(), message: 'failed-save-no-user' },
        ],
      }));
      return;
    }

    const saveData = {
      layerTitle,
      layers: layerList,
      timestamp: new Date().toISOString(),
    };

    try {
      const existingSet = await firestore.checkLayerSetExists(
        user.uid,
        layerTitle,
      );
      if (existingSet) {
        throw new Error('LayerSet already exists');
      }
      await firestore.addHistoryToFirestore(user.uid, saveData);

      set((state) => ({
        alertState: [
          ...state.alertState,
          { id: uuidv4(), message: 'success-save' },
        ],
      }));
    } catch (error) {
      if (error.message === 'LayerSet already exists') {
        set((state) => ({
          alertState: [
            ...state.alertState,
            { id: uuidv4(), message: 'layer-set-exists' },
          ],
        }));
      } else {
        set((state) => ({
          alertState: [
            ...state.alertState,
            { id: uuidv4(), message: 'failed-save' },
          ],
        }));
      }
      throw error;
    }
  },

  saveAsPreset: async () => {
    const { layerList, layerTitle } = get();

    const presetData = {
      name: layerTitle,
      layers: layerList,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      const presetsCollectionRef = collection(db, 'presets');
      const newPresetDocRef = doc(presetsCollectionRef);

      await setDoc(newPresetDocRef, presetData);

      set((state) => ({
        alertState: [
          ...state.alertState,
          { id: uuidv4(), message: 'success-save-preset' },
        ],
      }));
    } catch (error) {
      set((state) => ({
        alertState: [
          ...state.alertState,
          { id: uuidv4(), message: 'failed-save-preset' },
        ],
      }));
    }
  },

  loadSavedWork: async (saveId) => {
    const { user } = get();
    if (!user) return;

    try {
      const history = await firestore.getHistoryFromFirestore(user.uid);
      const selectedHistory = history.find((save) => save.id === saveId);

      if (selectedHistory) {
        set({
          layerList: selectedHistory.layers,
          layerTitle: selectedHistory.layerTitle,
        });

        await Promise.all(
          selectedHistory.layers.map((layer) =>
            firestore.addLayerToFirestore(user.uid, layer),
          ),
        );

        set({ layerList: selectedHistory.layers });
        set((state) => ({
          alertState: [
            ...state.alertState,
            { id: uuidv4(), message: 'Saved work loaded successfully' },
          ],
        }));
      }
    } catch (error) {
      set((state) => ({
        alertState: [
          ...state.alertState,
          { id: uuidv4(), message: 'Failed to load saved work' },
        ],
      }));
    }
  },

  exportLayersToSTL: () => {
    const exportFunc = get().exportToSTL;

    if (exportFunc) {
      exportFunc();
    }
  },

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

  setLayers: (layers) => {
    set({ layerList: layers });
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
      await setDoc(doc(db, 'users', user.uid), {
        layerTitle: 'Untitled',
        email: user.email,
        displayName: userName,
      });
      set({ user });
    } catch (error) {
      handleAuthError(error, set);
      throw error;
    }
  },

  async logout() {
    try {
      await auth.signOut();
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

  async addLayer(layerData = null) {
    const { uid } = useStore.getState().user;
    const currentLayers = useStore.getState().layerList;
    const maxIndex =
      currentLayers.length > 0
        ? Math.max(...currentLayers.map((layer) => layer.index))
        : 0;
    const newIndex = maxIndex + 1;

    let newLayer = {
      type: 'draw',
      index: newIndex,
      name: `Layer ${newIndex}`,
      height: 1,
      zIndex: currentLayers.length,
      visible: true,
      path: [],
      fill: '#0068ff',
    };

    if (layerData !== null) {
      newLayer = {
        ...newLayer,
        ...layerData,
        index: newIndex,
      };
    }

    await firestore.addLayerToFirestore(uid, newLayer);
  },

  updateLayer: (index, updatedProperties) => {
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

  copyLayer: async (layerId) => {
    const { layerList, addLayer } = get();
    const layerToCopy = layerList.find((layer) => layer.id === layerId);

    if (!layerToCopy) {
      return;
    }

    const newLayerIndex =
      Math.max(...layerList.map((layer) => layer.index)) + 1;
    const newLayer = {
      ...layerToCopy,
      id: null,
      index: newLayerIndex,
      name: `${layerToCopy.name} (Copy)`,
      zIndex: layerToCopy.zIndex,
    };

    delete newLayer.id;

    await addLayer(newLayer);
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
    useStore.getState().loadLayerTitle();
    useStore.setState({ user });
  } else {
    useStore.setState({ user: null });
  }
});

export default useStore;
