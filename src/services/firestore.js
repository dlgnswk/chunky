import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc as firestoreDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { db } from './firebase-config';

const subscribeToLayers = (userId, callback) => {
  const layersRef = collection(db, 'users', userId, 'layers');

  return onSnapshot(layersRef, (snapshot) => {
    const layers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(layers);
  });
};

async function addLayerToFirestore(uid, layer) {
  const layerCollectionRef = collection(db, 'users', uid, 'layers');

  const updatedPath = layer.path.map((path) => ({
    ...path,
    fill: path.fill || 'none',
  }));

  const layerWithUpdatedPath = {
    ...layer,
    path: updatedPath,
  };

  if ('id' in layerWithUpdatedPath) {
    delete layerWithUpdatedPath.id;
  }

  const docRef = await addDoc(layerCollectionRef, layerWithUpdatedPath);

  return docRef.id;
}

async function getLayersFromFirestore(uid) {
  const layerCollectionRef = collection(db, 'users', uid, 'layers');
  try {
    const querySnapshot = await getDocs(layerCollectionRef);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        path:
          data.path?.map((path) => ({
            ...path,
            fill: path.fill || 'none',
          })) || [],
        imageUrl: data.imageUrl || null,
      };
    });
  } catch (e) {
    return [];
  }
}

async function updateLayerImageUrl(uid, layerId, imageUrl) {
  const layerDocRef = firestoreDoc(db, 'users', uid, 'layers', layerId);
  try {
    await updateDoc(layerDocRef, { imageUrl });
    return true;
  } catch (e) {
    return false;
  }
}

async function deleteLayerFromFirestore(uid, id) {
  const layerDocRef = firestoreDoc(db, 'users', uid, 'layers', id);

  try {
    await deleteDoc(layerDocRef);
  } catch (e) {
    return false;
  }

  return true;
}

async function updateLayerInFirestoreDB(uid, layer) {
  if (!layer || typeof layer !== 'object' || !layer.id) {
    return false;
  }

  const layerDocRef = firestoreDoc(db, 'users', uid, 'layers', layer.id);
  try {
    const updatedLayer = { ...layer };
    if (layer.type === 'draw') {
      updatedLayer.path = layer.path.map((path) => ({
        ...path,
        fill: path.fill || 'none',
      }));
    }

    await updateDoc(layerDocRef, updatedLayer);

    return true;
  } catch (e) {
    return false;
  }
}

async function updateLayerHeight(uid, layerIndex, newHeight) {
  const layerRef = firestoreDoc(
    db,
    'users',
    uid,
    'layers',
    layerIndex.toString(),
  );
  try {
    await updateDoc(layerRef, { height: newHeight });

    return true;
  } catch (error) {
    return false;
  }
}

async function addHistoryToFirestore(uid, saveData) {
  const historyCollectionRef = collection(db, 'users', uid, 'history');

  const docRef = await addDoc(historyCollectionRef, saveData);
  return docRef.id;
}

async function getHistoryFromFirestore(uid) {
  const historyCollectionRef = collection(db, 'users', uid, 'history');
  try {
    const querySnapshot = await getDocs(historyCollectionRef);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    return [];
  }
}

async function checkLayerSetExists(uid, layerTitle) {
  const historyCollectionRef = collection(db, 'users', uid, 'history');
  const q = query(historyCollectionRef, where('layerTitle', '==', layerTitle));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function getPresetsFromFirestore() {
  const presetCollectionRef = collection(db, 'presets');
  try {
    const querySnapshot = await getDocs(presetCollectionRef);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (e) {
    return [];
  }
}

async function addPresetToFirestore(presetData) {
  const presetCollectionRef = collection(db, 'presets');
  try {
    const docRef = await addDoc(presetCollectionRef, presetData);
    return docRef.id;
  } catch (e) {
    return null;
  }
}

async function updatePresetInFirestore(presetId, updatedData) {
  const presetDocRef = firestoreDoc(db, 'presets', presetId);
  try {
    await updateDoc(presetDocRef, updatedData);
    return true;
  } catch (e) {
    return false;
  }
}

async function deletePresetFromFirestore(presetId) {
  const presetDocRef = firestoreDoc(db, 'presets', presetId);
  try {
    await deleteDoc(presetDocRef);
    return true;
  } catch (e) {
    return false;
  }
}

export default {
  addLayerToFirestore,
  getLayersFromFirestore,
  deleteLayerFromFirestore,
  updateLayerInFirestoreDB,
  subscribeToLayers,
  updateLayerHeight,
  addHistoryToFirestore,
  getHistoryFromFirestore,
  checkLayerSetExists,
  getPresetsFromFirestore,
  addPresetToFirestore,
  updatePresetInFirestore,
  deletePresetFromFirestore,
  updateLayerImageUrl,
};
