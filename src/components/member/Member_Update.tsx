import { useEffect, useState, type ChangeEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { axiosInstance, enter_chk, getIP } from '../Tool';
import SimpleModal, {type SimpleModalTypePayload} from '../SimpleModal';

const Member_Update = () => {
  const { memberno } = useParams();
  const navigate = useNavigate();

  // 현재 입력창의 값을 관리하는 상태
  const [input, setInput] = useState({
    memberno: 0,
    username: '',
    id: '',
    nickname: '',
    grade: 0,
    ccode: '',
    email: '',
    phone: ''
  });

  // 💡 [추가] 처음 불러온 유저의 '원래 값'을 따로 기억해둘 상태입니다. (수업 틀 유지용)
  const [originInput, setOriginInput] = useState({
    id: '',
    nickname: ''
  });

  const [id_msg, setId_msg] = useState('');
  const [nick_msg, setNick_msg] = useState('');

  // -------------------------------------------------------------------------------
  // SimpleModal
  // -------------------------------------------------------------------------------
  const [modal, setModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: undefined, 
  });

  const openModal = (payload: SimpleModalTypePayload) => setModal({ 
    show: true, 
    title: payload.title, 
    message: payload.message, 
    onConfirm: payload.onConfirm ?? undefined 
  });

  const closeModal = () => setModal((m) => ({ ...m, show: false }));
  // -------------------------------------------------------------------------------

  const onChange = (e:ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInput(prev => ({
      ...prev,
      [id]: id === 'grade' ? Number(value) : value,
    }));
  };

  useEffect(() => {
    axiosInstance.get(`/member/read/${memberno}`)
      .then(result => result.data)
      .then(data => {
        const fetchedData = {
          memberno: data.memberno,
          username: data.username,
          id: data.id,
          nickname: data.nickname || '',
          grade: Number(data.grade),
          ccode: data.ccode || '',
          email: data.emali || '',
          phone: data.phone || '',
        };
        
        setInput(fetchedData);
        
        // 💡 데이터를 처음 읽어올 때 원래 내 아이디와 닉네임을 백업해 둡니다.
        setOriginInput({
          id: data.id,
          nickname: data.nickname || ''
        });
      })
      .catch(err => {
        console.error(err);
        openModal({show: true, title: '오류', message: '회원 정보를 불러오지 못했습니다.' });
      });
  }, [memberno]);

  // 아이디 중복 검사 함수 고도화
  const checkId = () => {
    // 💡 [핵심] 입력창의 아이디가 기존 내 원래 아이디와 똑같다면 DB를 조회할 필요도 없이 통과입니다!
    if (input.id === originInput.id) {
      setId_msg('기존에 사용 중인 본인의 아이디입니다. (통과)');
      return;
    }

    console.log(`-> http://${getIP()}:9101/member/check_id?id=${input.id}`);
    axiosInstance.get(`/member/check_id?id=${encodeURIComponent(input.id)}`)
      .then(result => result.data)
      .then(data => {
        if (Number(data) === 0) {
          setId_msg('사용 가능한 아이디 입니다.');
        } else {
          setId_msg('사용 불가능한 아이디 입니다.');
        }
      })
      .catch(err => {
        console.error(err);
        openModal({show: true, title: '오류', message: '아이디 검사 중 오류가 발생했습니다.' });
      });
  };

  // 닉네임 중복 검사 함수 고도화
  const checkNickname = () => {
    // 💡 [핵심] 입력창의 닉네임이 기존 내 원래 닉네임과 똑같다면 DB를 조회할 필요도 없이 통과입니다!
    if (input.nickname === originInput.nickname) {
      setNick_msg('기존에 사용 중인 본인의 닉네임입니다. (통과)');
      return;
    }

    axiosInstance.get(`/member/check_nickname?nickname=${encodeURIComponent(input.nickname)}`)
      .then(result => result.data)
      .then(data => {
        if (Number(data) === 0) {
          setNick_msg('사용 가능한 닉네임 입니다.');
        } else {
          setNick_msg('사용 불가능한 닉네임 입니다.');
        }
      })
      .catch(err => {
        console.error(err);
        openModal({show: true, title: '오류', message: '닉네임 검사 중 오류가 발생했습니다.' });
      });
  };

  const send = (e:React.SyntheticEvent) => {
    e.preventDefault(); 

    // 수정 전송 시에도 원래 본인 값이라면 검사를 건너뛰거나 바로 전송하도록 흐름이 자연스러워집니다.
    axiosInstance.put('/member/update', {
      memberno: input.memberno,
      username: input.username,
      id: input.id,
      nickname: input.nickname,
      grade: input.grade,
      ccode: input.ccode,
      email: input.email,
      phone: input.phone
    })
    .then(result => result.data)
    .then(data => {
      if (data === 0) {
        openModal({ show: true, title: '변경 실패', message: '회원 정보 변경에 실패 했습니다.' });
      } else if (data === 1) {
        setId_msg('');
        setNick_msg('');
        openModal({ show: true, title: '변경 완료', message: '회원 정보를 변경 했습니다.', onConfirm: () => navigate('/') });
      }
    })
    .catch(err => { console.error(err); });
  };

  // ... 하단 return 구문(HTML 영역)은 기존과 완전히 100% 동일합니다 ...
  return (
    <div>
      <div className='title_line'>관리자 수정</div>
      <form onSubmit={send} style={{ margin: '10px auto', width: '70%', textAlign: 'left' }}>
        <div className="mb-3">
          <label className="form-label">성명</label>
          <input type="text" className="form-control form-control-sm" id="username" placeholder="성명" onChange={onChange} value={input.username} style={{ width: '50%' }} autoFocus />
        </div>
        <div className="mb-3">
          <label className="form-label">아이디</label>
          <div className="d-flex justify-content-center">
            <input type="text" className="form-control form-control-sm" id="id" placeholder="아이디" onChange={onChange} value={input.id} style={{ flex: 1, marginRight: '5px' }} />
            <button type='button' id='btnCheckId' onClick={checkId} className='btn btn-primary btn-sm'>중복 아이디 검사</button>
          </div>
          <span style={{ color: 'blue' }}>{id_msg}</span>
        </div>
        <div className="mb-3">
          <label className="form-label">닉네임</label>
          <div className="d-flex justify-content-center">
            <input type="text" className="form-control form-control-sm" id="nickname" placeholder="닉네임" onChange={onChange} value={input.nickname} style={{ flex: 1, marginRight: '5px' }} />
            <button type='button' id='btnCheckNick' onClick={checkNickname} className='btn btn-primary btn-sm'>중복 닉네임 검사</button>
          </div>
          <span style={{ color: 'green' }}>{nick_msg}</span>
        </div>
        <div className="mb-3">
          <label className="form-label">등급</label>
          <input type="number" className="form-control form-control-sm" id="grade" placeholder="등급" onChange={onChange} value={input.grade} style={{ width: '50%' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <button id='btnSend' type="submit" className="btn btn-primary btn-sm" style={{ marginRight: '10px' }}>수정 처리</button>
          <button id='btnTest' type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/')}>취소</button>
        </div>
      </form>
      <SimpleModal show={modal.show} title={modal.title} message={modal.message} onClose={closeModal} onConfirm={modal.onConfirm} />
    </div>
  );
};

export default Member_Update;