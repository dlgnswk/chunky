import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc as firestoreDoc,
  onSnapshot,
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
  try {
    // path 속성의 각 요소에 fill 속성이 없으면 'none'으로 설정
    const updatedPath = layer.path.map((path) => ({
      ...path,
      fill: path.fill || 'none',
    }));
    const layerWithUpdatedPath = { ...layer, path: updatedPath };
    const docRef = await addDoc(layerCollectionRef, layerWithUpdatedPath);
    return docRef.id;
  } catch (e) {
    return null;
  }
}

async function getLayersFromFirestore(uid) {
  const layerCollectionRef = collection(db, 'users', uid, 'layers');
  try {
    const querySnapshot = await getDocs(layerCollectionRef);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // path 속성의 각 요소에 fill 속성이 없으면 'none'으로 설정
      const updatedPath = data.path.map((path) => ({
        ...path,
        fill: path.fill || 'none',
      }));
      return { ...data, id: doc.id, path: updatedPath };
    });
  } catch (e) {
    return [];
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
    const updatedPath = Array.isArray(layer.path)
      ? layer.path.map((path) => ({
          ...path,
          fill: path.fill || 'none',
        }))
      : [];

    const layerToUpdate = {
      ...layer,
      path: updatedPath,
    };

    await updateDoc(layerDocRef, layerToUpdate);
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
};
