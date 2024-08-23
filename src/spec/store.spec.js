import { beforeEach, describe, expect, it, vi } from 'vitest';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import useStore from '../store/store';
import firestore from '../services/firestore';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(),
}));

vi.mock('../services/firestore', () => ({
  default: {
    addLayerToFirestore: vi.fn(),
    updateLayerInFirestoreDB: vi.fn(),
    deleteLayerFromFirestore: vi.fn(),
    checkLayerSetExists: vi.fn(),
    addHistoryToFirestore: vi.fn(),
    getHistoryFromFirestore: vi.fn(),
    subscribeToLayers: vi.fn(() => vi.fn()),
  },
}));

vi.mock('firebase/auth', () => {
  let authStateChangeCallback = null;
  return {
    getAuth: vi.fn(() => ({})),
    GoogleAuthProvider: vi.fn(),
    onAuthStateChanged: vi.fn((auth, callback) => {
      authStateChangeCallback = callback;
      return vi.fn();
    }),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(),
    __getAuthStateChangeCallback: () => authStateChangeCallback,
  };
});

vi.mock('../services/firebase-config', () => ({
  auth: {},
  db: {},
  storage: {},
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null);
    return vi.fn();
  }),
  googleProvider: {},
}));

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      user: { uid: 'testUser' },
      layerList: [],
      nextLayerIndex: 1,
      selectedLayer: null,
    });

    vi.clearAllMocks();
  });

  it('should add a new layer', async () => {
    firestore.addLayerToFirestore.mockResolvedValue('newLayerId');

    const { addLayer } = useStore.getState();

    await addLayer();

    const { layerList, nextLayerIndex, selectedLayer } = useStore.getState();

    expect(layerList).toHaveLength(1);
    expect(layerList[0]).toEqual({
      type: 'draw',
      index: 1,
      name: 'Layer 1',
      height: 1,
      zIndex: 0,
      visible: true,
      path: [],
      fill: '#0068ff',
      id: 'newLayerId',
    });

    expect(nextLayerIndex).toBe(2);

    expect(selectedLayer).toEqual(layerList[0]);

    expect(firestore.addLayerToFirestore).toHaveBeenCalledWith(
      'testUser',
      expect.any(Object),
    );
  });
});

describe('useStore - updateLayerInFirestore', () => {
  beforeEach(() => {
    useStore.setState({
      user: { uid: 'testUser' },
      layerList: [
        { id: 'layer1', name: 'Layer 1', path: [] },
        { id: 'layer2', name: 'Layer 2', path: [] },
      ],
    });

    vi.clearAllMocks();
  });

  it('should update a layer in Firestore and local state', async () => {
    firestore.updateLayerInFirestoreDB.mockResolvedValue(true);

    const { updateLayerInFirestore } = useStore.getState();

    const updatedLayer = {
      id: 'layer1',
      name: 'Updated Layer 1',
      path: [{ type: 'line', x1: 0, y1: 0, x2: 100, y2: 100 }],
    };

    const result = await updateLayerInFirestore(updatedLayer);

    expect(result).toBe(true);

    const { layerList } = useStore.getState();

    expect(layerList).toHaveLength(2);
    expect(layerList[0]).toEqual(updatedLayer);
    expect(layerList[1]).toEqual({ id: 'layer2', name: 'Layer 2', path: [] });

    expect(firestore.updateLayerInFirestoreDB).toHaveBeenCalledWith(
      'testUser',
      updatedLayer,
    );
  });

  it('should return false when update fails', async () => {
    firestore.updateLayerInFirestoreDB.mockResolvedValue(false);

    const { updateLayerInFirestore } = useStore.getState();

    const updatedLayer = { id: 'layer1', name: 'Updated Layer 1', path: [] };

    const result = await updateLayerInFirestore(updatedLayer);

    expect(result).toBe(false);

    const { layerList } = useStore.getState();

    expect(layerList).toHaveLength(2);
    expect(layerList[0]).toEqual({ id: 'layer1', name: 'Layer 1', path: [] });
    expect(layerList[1]).toEqual({ id: 'layer2', name: 'Layer 2', path: [] });

    expect(firestore.updateLayerInFirestoreDB).toHaveBeenCalledWith(
      'testUser',
      updatedLayer,
    );
  });
});

describe('useStore - copyLayer', () => {
  beforeEach(() => {
    useStore.setState({
      user: { uid: 'testUser' },
      layerList: [
        {
          id: 'layer1',
          index: 1,
          name: 'Layer 1',
          path: [],
          zIndex: 0,
          type: 'draw',
          visible: true,
          fill: '#0068ff',
          height: 1,
        },
        {
          id: 'layer2',
          index: 2,
          name: 'Layer 2',
          path: [],
          zIndex: 1,
          type: 'draw',
          visible: true,
          fill: '#0068ff',
          height: 1,
        },
      ],
      nextLayerIndex: 3,
    });

    vi.clearAllMocks();
  });

  it('should copy a layer and add it to the layerList', async () => {
    firestore.addLayerToFirestore.mockResolvedValue('newLayerId');

    const { copyLayer } = useStore.getState();

    await copyLayer('layer1');

    const { layerList, nextLayerIndex } = useStore.getState();

    expect(layerList).toHaveLength(3);
    expect(layerList[2]).toEqual({
      id: 'newLayerId',
      index: 3,
      name: 'Layer 1 (Copy)',
      path: [],
      zIndex: 0,
      type: 'draw',
      visible: true,
      fill: '#0068ff',
      height: 1,
    });
    expect(nextLayerIndex).toBe(4);

    expect(firestore.addLayerToFirestore).toHaveBeenCalledWith(
      'testUser',
      expect.objectContaining({
        index: 3,
        name: 'Layer 1 (Copy)',
        path: [],
        zIndex: 0,
        type: 'draw',
        visible: true,
        fill: '#0068ff',
        height: 1,
      }),
    );
  });
});

describe('useStore - removeLayer', () => {
  beforeEach(() => {
    useStore.setState({
      user: { uid: 'testUser' },
      layerList: [
        { id: 'layer1', index: 1, name: 'Layer 1' },
        { id: 'layer2', index: 2, name: 'Layer 2' },
        { id: 'layer3', index: 3, name: 'Layer 3' },
      ],
      selectedLayer: { id: 'layer2', index: 2, name: 'Layer 2' },
    });
    vi.clearAllMocks();
  });

  it('should remove a layer and update selectedLayer', async () => {
    firestore.deleteLayerFromFirestore.mockResolvedValue(true);

    const { removeLayer } = useStore.getState();

    await removeLayer(2);

    const { layerList, selectedLayer } = useStore.getState();

    expect(layerList).toHaveLength(2);
    expect(layerList).toEqual([
      { id: 'layer1', index: 1, name: 'Layer 1' },
      { id: 'layer3', index: 3, name: 'Layer 3' },
    ]);

    expect(selectedLayer).toEqual({ id: 'layer1', index: 1, name: 'Layer 1' });

    expect(firestore.deleteLayerFromFirestore).toHaveBeenCalledWith(
      'testUser',
      'layer2',
    );
  });

  it('should handle removing the last layer', async () => {
    useStore.setState({
      layerList: [{ id: 'layer1', index: 1, name: 'Layer 1' }],
      selectedLayer: { id: 'layer1', index: 1, name: 'Layer 1' },
    });

    firestore.deleteLayerFromFirestore.mockResolvedValue(true);

    const { removeLayer } = useStore.getState();

    await removeLayer(1);

    const { layerList, selectedLayer } = useStore.getState();

    expect(layerList).toHaveLength(0);
    expect(selectedLayer).toBeNull();

    expect(firestore.deleteLayerFromFirestore).toHaveBeenCalledWith(
      'testUser',
      'layer1',
    );
  });

  it('should not remove a layer if it does not exist', async () => {
    const { removeLayer } = useStore.getState();

    await removeLayer(4);

    const { layerList, selectedLayer } = useStore.getState();

    expect(layerList).toHaveLength(3);
    expect(selectedLayer).toEqual({ id: 'layer1', index: 1, name: 'Layer 1' });

    expect(firestore.deleteLayerFromFirestore).not.toHaveBeenCalled();
  });
});

describe('useStore - setCameraView', () => {
  it('should update camera view', () => {
    const { setCameraView } = useStore.getState();

    const position = { x: 1, y: 2, z: 3 };
    const target = { x: 4, y: 5, z: 6 };
    const up = { x: 0, y: 1, z: 0 };

    setCameraView(position, target, up);

    const { cameraPosition, cameraTarget, cameraUp } = useStore.getState();

    expect(cameraPosition).toEqual(position);
    expect(cameraTarget).toEqual(target);
    expect(cameraUp).toEqual(up);
  });
});

describe('useStore - setExportToSTL', () => {
  it('should set exportToSTL function', () => {
    const { setExportToSTL } = useStore.getState();

    const mockExportFunction = vi.fn();
    setExportToSTL(mockExportFunction);

    const { exportToSTL } = useStore.getState();

    expect(exportToSTL).toBe(mockExportFunction);
  });
});

describe('useStore - exportLayersToSTL', () => {
  it('should call exportToSTL function if set', () => {
    const mockExportFunction = vi.fn();
    useStore.setState({ exportToSTL: mockExportFunction });

    const { exportLayersToSTL } = useStore.getState();

    exportLayersToSTL();

    expect(mockExportFunction).toHaveBeenCalled();
  });

  it('should not throw if exportToSTL function is not set', () => {
    useStore.setState({ exportToSTL: null });

    const { exportLayersToSTL } = useStore.getState();

    expect(() => exportLayersToSTL()).not.toThrow();
  });
});

describe('useStore - initializeLayerListener', () => {
  it('should initialize layer listener and update state', () => {
    const mockSubscribe = vi.fn(() => vi.fn());
    firestore.subscribeToLayers = mockSubscribe;

    const { initializeLayerListener } = useStore.getState();
    const userId = 'testUser';

    const unsubscribe = initializeLayerListener(userId);

    expect(mockSubscribe).toHaveBeenCalledWith(userId, expect.any(Function));
    expect(unsubscribe).toBeInstanceOf(Function);

    const updatedLayers = [{ id: 'layer1', name: 'Updated Layer', index: 1 }];
    mockSubscribe.mock.calls[0][1](updatedLayers);

    const { layerList } = useStore.getState();
    expect(layerList).toEqual(updatedLayers);
  });
});

describe('useStore - saveAsPreset', () => {
  beforeEach(() => {
    useStore.setState({
      layerList: [{ id: 'layer1', name: 'Layer 1' }],
      layerTitle: 'Test Preset',
      alertState: [],
    });
    vi.clearAllMocks();
  });

  it('should save current layers as a preset', async () => {
    const mockCollectionRef = {};
    const mockDocRef = {};
    collection.mockReturnValue(mockCollectionRef);
    doc.mockReturnValue(mockDocRef);
    setDoc.mockResolvedValue();
    serverTimestamp.mockReturnValue('mocked-timestamp');

    const { saveAsPreset } = useStore.getState();

    await saveAsPreset();

    expect(collection).toHaveBeenCalledWith(expect.anything(), 'presets');
    expect(doc).toHaveBeenCalledWith(mockCollectionRef);
    expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
      name: 'Test Preset',
      layers: [{ id: 'layer1', name: 'Layer 1' }],
      createdAt: 'mocked-timestamp',
      updatedAt: 'mocked-timestamp',
    });

    const { alertState } = useStore.getState();
    expect(alertState[0].message).toBe('success-save-preset');
  });

  it('should handle errors when saving preset', async () => {
    setDoc.mockRejectedValue(new Error('Firestore error'));

    const { saveAsPreset } = useStore.getState();

    await saveAsPreset();

    const { alertState } = useStore.getState();
    expect(alertState[0].message).toBe('failed-save-preset');
  });
});
