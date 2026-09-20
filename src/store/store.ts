import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { axiosInstance } from '../components/Tool' // ⬅️ axiosInstance 경로 확인 (보통 ../Tool 또는 ../components/Tool)

// 카테고리 아이템 타입 정의
export interface CateItem {
  cateno: number;
  grp: string;
  name: string;
  cnt: number;
  seqno: number;
  visible: string;
  rdate: string;
}

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

  // 💡 카테고리 관련 상태 및 함수 추가
  categories: CateItem[];
  setCategories: (categories: CateItem[]) => void;
  loadCategories: () => Promise<void>;
}

export const GlobalStoreSession = create<SessionStore>()(
  persist(
    (set) => ({
      memberno: 99,
      setMemberno: (value) => set({ memberno: value }),
      login: false,
      setLogin: (value) => set({ login: value }),
      id: '',
      setId: (value) => set({ id: value }),
      grade: 99,
      setGrade: (value) => set({ grade: value }),

      // 💡 카테고리 초기값 및 로딩 로직
      categories: [],
      setCategories: (categories) => set({ categories }),
      loadCategories: async () => {
        try {
          // 백엔드 CateCont의 listAllVisible 호출 (/cate/list_all_visible)
          const res = await axiosInstance.get('/cate/list_all_visible');
          if (Array.isArray(res.data)) {
            set({ categories: res.data });
          }
        } catch (err) {
          console.error('카테고리 로딩 실패:', err);
        }
      }
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