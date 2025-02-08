import { create } from 'zustand';

interface UseSidebarType {
  isOpen: boolean;
  setOpen: () => void;
};

interface UseTextType {
  text: string;
  setText: (text: string) => void;
};

interface UseIsInputFocusType {
  isInputFocus: boolean;
  setInputFocus: (focus: boolean) => void;
};

interface UseOpenConvoInformationType {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

interface UseChangeGcNameType {
  isChangeName: boolean;
  setIsChangeName: (isOpen: boolean) => void;
}

interface UseAddPeopleType {
  isAddPeople: boolean;
  setIsAddPeople: (isAdd: boolean) => void;
};

export const useSidebar = create<UseSidebarType>(set => ({
  isOpen: false,
  setOpen: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useText = create<UseTextType>(set => ({
  text: "",
  setText: (text) => set({ text })
}));

export const useInputFocus = create<UseIsInputFocusType>(set => ({
  isInputFocus: false,
  setInputFocus: (focus) => set({ isInputFocus: focus }),
}))

export const useOpenConvoInformation = create<UseOpenConvoInformationType>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen: boolean) => set({ isOpen })
}));

export const useChangeGcName = create<UseChangeGcNameType>((set) => ({
  isChangeName: false,
  setIsChangeName: (isOpen) => set({ isChangeName: isOpen })
}));

export const UseAddPeople = create<UseAddPeopleType>(set => ({
  isAddPeople: false,
  setIsAddPeople: (isAdd) => set({ isAddPeople: isAdd })
}))