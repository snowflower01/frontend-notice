import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { axiosInstance } from '../Tool';
import { type Member } from './MemberType';

const Member_Read = () => {
  const Navigate = useNavigate();
  const { memberno } = useParams();
  const [data, setData] = useState<Member | null>(null);

  useEffect(() => {
    axiosInstance.get(`/member/read/${memberno}`)
    .then(result => result.data)
    .then(data => {
      console.log('-> axiosInstance data:', data);
      setData(data);
    })
    .catch(err => console.error(err));
  }, [memberno]);

  if (!data) {
    return null;
  }

  return (
    <div>
      {/* 수업 예제와 완벽 일치하는 타이틀 헤더 라인 */}
      <div className='title_line'>{data.username + ' 조회'}</div>
      
      {/* 정렬된 전체 폼 컨테이너 블록 */}
      <div style={{ margin: '20px auto', width: '60%', textAlign: 'left' }}>
        
        {/* 사원 번호 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">사원 번호</label>
          <div className='div_row_content'>{data.memberno}</div>
        </div>

        {/* 아이디 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">아이디</label>
          <div className='div_row_content'>{data.id}</div>
        </div>
        
        {/* 성명 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">성명</label>
          <div className='div_row_content'>{data.username}</div>
        </div>

        {/* 닉네임 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">닉네임</label>
          <div className='div_row_content'>{data.nickname}</div>
        </div>

        {/* 전화번호 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">전화번호</label>
          <div className='div_row_content'>{data.phone}</div>
        </div>

        {/* 이메일 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">이메일</label>
          <div className='div_row_content'>{data.email}</div>
        </div>

        {/* 쿠코드 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">쿠코드</label>
          <div className='div_row_content'>{data.ccode}</div>
        </div>

        {/* 등급 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">등급</label>
          <div className='div_row_content'>{data.grade}</div>
        </div>      
        
        {/* 조회수 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">조회수</label>
          <div className='div_row_content'>{data.cnt}</div>
        </div> 

        {/* 등록일 */}
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">등록일</label>
          <div className='div_row_content'>{data.createdate}</div>
        </div>    
        
        {/* 하단 버튼 유닛 (수업 예제 스타일의 간격 및 부트스트랩 클래스) */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>              
          <button 
            type="button" 
            className="btn btn-outline-warning btn-sm" 
            style={{ marginRight: '10px' }} 
            onClick={() => Navigate(`/member/update/${data.memberno}`)}
          >
            수정
          </button>
          <button 
            type="button" 
            className="btn btn-outline-info btn-sm" 
            onClick={() => Navigate('/member/update_password')}
          >
            패스워드 변경
          </button>
        </div>

      </div>
    </div>
  )
}

export default Member_Read;