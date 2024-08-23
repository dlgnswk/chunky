import { describe, it, expect, vi } from 'vitest';
import { addDoc, getDocs } from 'firebase/firestore';
import firestoreService from '../services/firestore';

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    collection: vi.fn().mockReturnValue('mock-collection-ref'),
    addDoc: vi.fn().mockResolvedValue({ id: 'mock-layer-id' }),
    getDocs: vi.fn().mockResolvedValue({
      docs: [
        {
          id: 'layer1',
          data: () => ({ path: [], type: 'draw', imageUrl: null }),
        },
        {
          id: 'layer2',
          data: () => ({
            path: [],
            type: 'image',
            imageUrl: 'http://example.com/image.png',
          }),
        },
      ],
    }),
  };
});

describe('Firestore Service', () => {
  describe('addLayerToFirestore', () => {
    it('should add a layer and return the document ID', async () => {
      const uid = 'user123';
      const layer = { path: [], type: 'draw' };

      const docId = await firestoreService.addLayerToFirestore(uid, layer);

      expect(docId).toBe('mock-layer-id');
      expect(addDoc).toHaveBeenCalledWith('mock-collection-ref', {
        path: [],
        type: 'draw',
      });
    });
  });

  describe('getLayersFromFirestore', () => {
    it('should retrieve layers from Firestore', async () => {
      const uid = 'user123';
      const layers = await firestoreService.getLayersFromFirestore(uid);

      expect(layers).toEqual([
        { id: 'layer1', path: [], type: 'draw', imageUrl: null },
        {
          id: 'layer2',
          path: [],
          type: 'image',
          imageUrl: 'http://example.com/image.png',
        },
      ]);

      expect(getDocs).toHaveBeenCalledWith('mock-collection-ref');
    });
  });
});
