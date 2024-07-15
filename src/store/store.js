import create from 'zustand';

const useStore = create((set) => ({
  isModalOpened: false,
  modalType: '',
  setIsModalOpened: (isOpen) => set({ isModalOpened: isOpen }),
  setModalType: (type) => set({ modalType: type }),
}));

export default useStore;
