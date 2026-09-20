export default interface CateType {
  cateno: number;
  name: string;
  grp: string;
  seqno: number;
  visible?: string; // 👈 추가 ('Y' | 'N' 형태이므로 string 또는 선택적 프로퍼티로 선언)
  cnt?: number;
  rdate?: string;
}