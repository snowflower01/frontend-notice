import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface GlobalStore {
  login: boolean; // 로그인 여부 처리
  setLogin: (value: boolean) => void;
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      login: false,
      setLogin: (value) => set({login: value})
    }),
    {
      name: 'global-store', // sessionStorage에 저장될 key 이름
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

