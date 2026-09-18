// 💡 백엔드 MemberDTO와 규격을 완벽하게 매싱한 개인 프로젝트용 인터페이스
export interface Member {
  memberno: number;      // 사원 번호 (PK, 숫자형)
  id: string;            // 사원 아이디
  password?: string;     // 패스워드 (선택적 프로퍼티)
  username: string;      // 이름 (수업의 mname 자리에 username 매싱)
  nickname: string;      // 별명(닉네임)
  phone: string;         // 전화번호
  email: string;         // 메일 주소
  createdate?: string;   // 가입 날짜 (선택적 프로퍼티 처리)
  ccode: string;         // 쿠코드
  
  grade: number;         // 등급 (숫자형 권장)
  cnt: number;           // 카운트/조회수 (숫자형)
  new_password?: string; // 새로운 패스워드 (패스워드 변경 화면용)
}

export type MemberList = Member[];