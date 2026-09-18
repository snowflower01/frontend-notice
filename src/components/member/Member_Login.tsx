import {useState, type ChangeEvent} from 'react'
import {enter_chk, axiosInstance} from '../Tool'
import {GlobalStoreSession} from '../../store/store.js'
import {GlobalStoreCookie} from '../../store/store.js'
import { useNavigate } from 'react-router-dom'
import SimpleModal, {type SimpleModalTypePayload} from '../SimpleModal';
import { type Member } from './MemberType';

const Member_Login = () => {
  // -------------------------------------------------------------------------------
  // SimpleModal
  // -------------------------------------------------------------------------------
  // modal state
  const [modal, setModal] = useState<SimpleModalTypePayload>({
    show: false,
    title: '',
    message: '',
    onConfirm: undefined,
  });

  const openModal = (payload:SimpleModalTypePayload) => setModal(
    { show: true, 
      title: payload.title, 
      message: payload.message, 
      // payload.onConfirm이 null일 경우 undefined로 변환하여 에러 방지
      onConfirm: payload.onConfirm ?? undefined  }
  );
  const closeModal = () => setModal((m) => ({ ...m, show: false }));
  // -------------------------------------------------------------------------------
  
  const navigate = useNavigate();

  const {setLogin, id, setId, grade, setGrade, memberno, setMemberno} = GlobalStoreSession();

  const {storeId, setStoreId, 
         password, setPassword, storePassword, setStorePassword} = GlobalStoreCookie();

  console.log('-> Cookie 로그인 정보');       
  console.log('-> id:', id);
  console.log('-> storeId:', storeId);
  console.log('-> password:', password);
  console.log('-> storePassword:', storePassword);

  // 상태 객체 사용
  const [input, setInput] = useState(
    {
      id: id,
      password: password,
      grade: 99
    }    
  );

  // e.target: event가 발생한 태그
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // 구조분해할당
    // const{id, value} = e.target;
    // console.log(`-> ${id}: ${value}`);
    setInput({
      ...input,  // input 객체의 값 할당
      [e.target.id]: e.target.value, // 해당하는 변수의 값을 덮어씀    
    });
  }

  // const [storId, setStoreId] = useState(true);
  // const [storePassword, setStorePassword] = useState(true);

  // id 저장 체크박스 이벤트 처리
  const setStoreIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked === true) {
      setStoreId(true);
    } else {
      setStoreId(false);
    }
  }

  // password 저장 체크박스 이벤트 처리
  const setStorePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked === true) {
      setStorePassword(true);
    } else {
      setStorePassword(false);
    }
  }

  const test = () => {
    setInput({
      id: 'admin1', // 해당하는 변수의 값을 덮어씀    
      password: '1234',
      grade: 6
    });
  }

  const send = async (e:React.SyntheticEvent) => {
    e.preventDefault();

    const loginResult = await axiosInstance.post(`/member/login?id=${input.id}&password=${input.password}`);
    const loginResultData = loginResult.data;

    console.log('-> axiosInstance data:' + loginResultData);

    if (loginResultData === 1) { // 1: 로그인 성공, 0: 로그인 실패
      console.log('-> login success');
      setLogin(true); 

      // 아이디 저장 체크 여부 확인
      if (storeId === true) {
        setId(input.id);
        setStoreId(true);
      } else {
        setId('');
        setStoreId(false);
      }

      // 패스워드 저장 체크 여부 확인
      if (storePassword === true) {
        setPassword(input.password);
        setStorePassword(true);
      } else {
        setPassword('');
        setStorePassword(false);
      }

      // 회원 정보 읽기: grade
      // const [data, setData] = useState<Member | null>(null);

      const memberResult = await axiosInstance.get(`/member/read_id/${input.id}`);
      const memberResultData = memberResult.data;
      console.log('-> memberResultData.grade:' + memberResultData.grade);
      setGrade(memberResultData.grade);
      setId(memberResultData.id);
      setMemberno(memberResultData.memberno);

      navigate('/');
    } else {
      openModal({
        show: true,
        title: '로그인 실패',
        message: '로그인 정보를 다시 입력해주세요.',
      });
    }
  }

  return (
    <div>
      <div className='title_line' >관리자 로그인</div>
      <form onSubmit={send} style={{margin:'10px auto', width:'50%', textAlign:'left'}}>
        <div className="mb-3 mt-3">
          <label className="form-label">아이디:</label>
          <input type="text" className="form-control" id="id" placeholder="아이디" autoFocus
                  onKeyDown={e=>enter_chk(e,'password')} onChange={onChange} value={input.id} />
        </div>
        <div className='mb-3 form-check div_row_left'>
          <input type="checkbox" id="storeId" className="form-check-input"
                 onChange={setStoreIdChange} checked={storeId}
                 style={{marginTop: '0px'}} />
          <label className='form-check-label' htmlFor='storeId'>아이디 저장</label>
        </div>        

        <div className="mb-3">
          <label className="form-label">패스워드:</label>
          <input type="password" className="form-control" id="password" placeholder="패스워드"
                 onKeyDown={e=>enter_chk(e,'btnSend')} onChange={onChange} value={input.password} />
        </div>

        <div className='mb-3 form-check div_row_left'>
          <input type="checkbox" id="storePassword" className="form-check-input"
                 onChange={setStorePasswordChange} checked={storePassword}
                 style={{marginTop: '0px'}}  />
          <label className='form-check-label' htmlFor='storePassword'>패스워드 저장</label>
        </div>        

        <div style={{textAlign:'center'}}>
          <button id='btnSend' type="submit" className="btn btn-primary btn-sm" style={{marginRight:'10px'}}>로그인</button>
          <button id='btnTest' type="button" className="btn btn-primary btn-sm" onClick={test} style={{marginRight:'10px'}}>테스트 계정</button>
          <button id='btnSignup' type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/member/signup')}>회원 가입</button>
        </div>
      </form>

      {/* 모달 */}
      <SimpleModal
        show={!!modal.show}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={closeModal}
      />      
    </div>
  )
}

export default Member_Login
