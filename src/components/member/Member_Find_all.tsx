import { useEffect, useState } from 'react'
import { axiosInstance } from '../Tool'; // 💡 공통 Tool 인스턴스 경로
import { Link, useNavigate } from 'react-router-dom'
import { type Member } from './MemberType'; 
import { GlobalStoreSession } from '../../store/store';

const Member_Find_all = () => {
  console.log('-> Member_Find_all 렌더링');
  const navigate = useNavigate();
  const [data, setData] = useState<Member[]>([]); 
  
  // 🎯 만든 적 없는 명칭 폐기, 오리지널 GlobalStoreSession 연동
  const login = GlobalStoreSession((state: any) => state.login);

  useEffect(() => {
    // 🎯 [요구사항 반영] 오직 로그인 시에만 데이터를 가져오고 아니면 차단
    if (!login) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/member/login');
      return;
    }

    axiosInstance.get('/member/find_all')
      .then(result => result.data)
      .then(resData => {
        console.log('-> 수신 데이터:', resData);
        setData(Array.isArray(resData) ? resData : []);
      })
      .catch(err => console.error("사원 목록 호출 실패:", err));
  }, [login, navigate]); 

  return (
    <div className="container mt-4">
      <h4 className="mb-3" style={{ fontWeight: 'bold' }}>회원(관리자)목록</h4>
      <table className='table_center table table-hover align-middle'>
        <thead>
          <tr style={{ textAlign: 'center', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
            <td style={{ width: '60px' }}>번호</td>
            <td>아이디</td>
            <td>이름</td>
            <td>닉네임</td>
            <td>쿠코드</td>
            <td>등급</td>
            <td>가입일</td>
            <td style={{ width: '120px' }}>관리</td>
          </tr>
        </thead>
        <tbody>
          {
            data.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                  등록된 사원이 없습니다.
                </td>
              </tr>
            ) : (
              data.map((item, index) => 
                <tr key={item.memberno || index} style={{ textAlign: 'center' }}>
                  <td className='table_underline'>{index + 1}</td>  
                  
                  <td className='table_underline'>
                    <Link to={`/member/read/${item.memberno}`} style={{ textDecoration: 'none', fontWeight: '500' }}>
                      {item.id}
                    </Link>
                  </td>  
                  
                  <td className='table_underline'>
                    <Link to={`/member/read/${item.memberno}`} style={{ textDecoration: 'none' }}>
                      {item.username} 
                    </Link>                    
                  </td>  
                  
                  <td className='table_underline'>{item.nickname}</td>
                  <td className='table_underline'>{item.ccode}</td>
                  <td className='table_underline'>
                    <span className="badge bg-secondary">{item.grade}</span>
                  </td>
                  
                  <td className='table_underline'>
                    {item.createdate ? item.createdate.replace('T', ' ').substring(0, 16) : ''}
                  </td>
                  
                  <td className='table_underline'>
                    <Link to={`/member/update/${item.memberno}`} className="btn btn-sm btn-outline-primary me-1" style={{ padding: '2px 6px', fontSize: '12px' }}>수정</Link> 
                    <Link to={`/member/delete/${item.memberno}`} className="btn btn-sm btn-outline-danger" style={{ padding: '2px 6px', fontSize: '12px' }}>삭제</Link>
                  </td>
                </tr>
              )
            )
          }
        </tbody>
      </table>
    </div>
  )
}

export default Member_Find_all;