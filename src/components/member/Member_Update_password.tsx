import { useState, type ChangeEvent } from 'react';
import { enter_chk, axiosInstance } from '../Tool';
import { useNavigate } from 'react-router-dom';

const Member_Update_password = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    id: 'user1',        // 로그인된 사원 ID (임시 user1)
    password: '',       // 현재 비밀번호
    new_password: '',   // 새 비밀번호
    password2: ''       // 새 비밀번호 확인
  });

  const [msg, setMsg] = useState('');

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInput(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const send = (e: React.SyntheticEvent) => {
    e.preventDefault();

    // 1️⃣ 새 비밀번호 일치 확인
    if (input.new_password !== input.password2) {
      setMsg('새로 입력한 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    if (!input.password || !input.new_password) {
      setMsg('모든 비밀번호 필드를 입력해 주세요.');
      return;
    }

    // 2️⃣ 현재 비밀번호 일치 확인 및 변경 요청
    axiosInstance.post('/member/update_password', {
      id: input.id,
      password: input.password,
      new_password: input.new_password
    })
    .then(result => result.data)
    .then(sw => {
      if (sw === 1) {
        alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인 해주세요.');
        navigate('/'); 
      } else if (sw === 2) {
        setMsg('현재 비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
      } else {
        setMsg('비밀번호 변경에 실패했습니다. (시스템 에러)');
      }
    })
    .catch(err => {
      console.error(err);
      setMsg('서버와 통신 중 오류가 발생했습니다.');
    });
  };

  return (
    <div>
      <div className='title_line'>비밀번호 변경</div>
      
      {/* 폼 전체 중앙 배치 및 가독성 좋은 폭 세팅 */}
      <div style={{ margin: '20px auto', width: '55%', textAlign: 'left' }}>
        
        {/* 사원 ID */}
        <div className="mb-3" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: '5px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
          <span className="div_row_label" style={{ width: '140px', padding: '10px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block', flexShrink: 0, margin: 0, borderRight: '1px solid #dee2e6' }}>사원 ID</span>
          <div style={{ flex: 1, padding: '5px 15px' }}>
            <input type="text" className="form-control form-control-sm" id="id" 
                   value={input.id} disabled style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }} />
          </div>
        </div>

        {/* 현재 비밀번호 */}
        <div className="mb-3" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: '5px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
          <span className="div_row_label" style={{ width: '140px', padding: '10px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block', flexShrink: 0, margin: 0, borderRight: '1px solid #dee2e6' }}>현재 비밀번호</span>
          <div style={{ flex: 1, padding: '5px 15px' }}>
            <input type="password" className="form-control form-control-sm" id="password" placeholder="현재 비밀번호 입력"
                   onKeyDown={e => enter_chk(e, 'new_password')} onChange={onChange} value={input.password} autoFocus style={{ maxWidth: '70%' }} />
          </div>
        </div>

        {/* 새 비밀번호 */}
        <div className="mb-3" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: '5px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
          <span className="div_row_label" style={{ width: '140px', padding: '10px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block', flexShrink: 0, margin: 0, borderRight: '1px solid #dee2e6' }}>새 비밀번호</span>
          <div style={{ flex: 1, padding: '5px 15px' }}>
            <input type="password" className="form-control form-control-sm" id="new_password" placeholder="새로운 비밀번호 입력"
                   onKeyDown={e => enter_chk(e, 'password2')} onChange={onChange} value={input.new_password} style={{ maxWidth: '70%' }} />
          </div>
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="mb-3" style={{ display: 'flex', alignItems: 'center', background: '#f8f9fa', borderRadius: '5px', overflow: 'hidden', border: '1px solid #dee2e6' }}>
          <span className="div_row_label" style={{ width: '140px', padding: '10px', textAlign: 'center', fontWeight: 'bold', display: 'inline-block', flexShrink: 0, margin: 0, borderRight: '1px solid #dee2e6' }}>새 비밀번호 확인</span>
          <div style={{ flex: 1, padding: '5px 15px' }}>
            <input type="password" className="form-control form-control-sm" id="password2" placeholder="새로운 비밀번호 재입력"
                   onKeyDown={e => enter_chk(e, 'btnSend')} onChange={onChange} value={input.password2} style={{ maxWidth: '70%' }} />
          </div>
        </div>

        {/* 에러 메시지 출력 */}
        {msg && (
          <div style={{ textAlign: 'center', color: 'red', fontWeight: 'bold', margin: '15px 0' }}>
            {msg}
          </div>
        )}

        {/* 하단 버튼 배치 */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>              
          <button 
            id="btnSend"
            type="button" 
            className="btn btn-outline-info btn-sm" 
            style={{ marginRight: '10px' }}
            onClick={send}
          >
            비밀번호 변경
          </button>
          <button 
            type="button" 
            className="btn btn-outline-warning btn-sm" 
            onClick={() => navigate(-1)} 
          >
            취소
          </button>
        </div>

      </div>
    </div>
  );
};

export default Member_Update_password;