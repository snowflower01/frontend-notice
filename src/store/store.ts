import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// 1. 기존 쿠키 저장소 정의
const cookieStorage = {
  getItem: (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? JSON.parse(match[2]) : null
  },
  setItem: (name: string, value: any) => {
    document.cookie = `${name}=${JSON.stringify(value)}; path=/; max-age=30` // 30초 후 만료
  },
  removeItem: (name: string) => {
    document.cookie = `${name}=; Max-Age=0; path=/`
  },
}

// ==========================================
// Session
// ==========================================
interface SessionStore {
  memberno: number;
  setMemberno: (value: number) => void;
  login: boolean;
  setLogin: (value: boolean) => void;
  id: string;
  setId: (value: string) => void;
  grade: number;
  setGrade: (value: number) => void;
}

export const GlobalStoreSession = create<SessionStore>()(
  persist(
    (set) => ({
      memberno: 99,
      setMemberno: (value) => set({memberno: value}),
      login: false,
      setLogin: (value) => set({ login: value }),
      id: '',
      setId: (value) => set({ id: value }),
      grade: 99,
      setGrade: (value) => set({ grade: value })
    }),
    {
      name: 'auth-cookie-store',
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);

// ==========================================
// Cookie
// ==========================================
interface CookieStore {
  storeId: boolean;
  setStoreId: (value: boolean) => void;
  password: string;
  setPassword: (value: string) => void;
  storePassword: boolean;
  setStorePassword: (value: boolean) => void; 
}

export const GlobalStoreCookie = create<CookieStore>()(
  persist(
    (set) => ({
      storeId: false,
      setStoreId: (value) => set({ storeId: value }),
      password: '',
      setPassword: (value) => set({ password: value }),
      storePassword: false,
      setStorePassword: (value) => set({ storePassword: value }),
    }),
    {
      name: 'settings-session-store',
      storage: createJSONStorage(() => cookieStorage), 
    }
  )
);

