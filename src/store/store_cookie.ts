import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 쿠키 저장소 정의
const cookieStorage = {
  getItem: (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? JSON.parse(match[2]) : null
  },
  setItem: (name: string, value:any) => {
    document.cookie = `${name}=${JSON.stringify(value)}; path=/; max-age=30` // 초
  },
  removeItem: (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/`
  },
}

interface GlobalStore {
  login: boolean; // 로그인 여부 처리
  setLogin: (value: boolean) => void;
  id: string; // 아이디
  setId: (value:string) => void;
  storeId: boolean, // 아이디 저장 여부
  setStoreId: (value:boolean) => void;
  password: string; // 패스워드
  setPassword: (value:string) => void;
  storePassword: boolean; // 패스워드 저장 여부
  setStorePassword: (value: boolean) => void; 
  grade: number; // 등급
  setGrade: (value:number) => void;
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      login: false,
      setLogin: (value) => set({login: value}),
      id: '',
      setId: (value) => set({id: value}),
      storeId: false,
      setStoreId: (value) => set({storeId: value}),
      password: '',
      setPassword: (value) => set({password: value}),
      storePassword: false,
      setStorePassword: (value) => set({storePassword: value}),
      grade: 99,
      setGrade: (value) => set({grade: value})
    }),
    {
      name: 'global-store', // sessionStorage에 저장될 key 이름
      storage: createJSONStorage(() => cookieStorage), 
    }
  )
);

