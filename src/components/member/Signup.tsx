// /src/components/member/Signup.tsx
import React, { useState, type ChangeEvent } from 'react'
import { enter_chk, getIP, axiosInstance } from '../Tool'
import { useNavigate } from 'react-router-dom'

const Signup = () => {
  // 💡 백엔드 MemberDTO 규격에 완벽 매싱 (mname -> username 변경 및 신규 컬럼 세팅)
  const [input, setInput] = useState({
    username: '투투투',
    id: 'user',
    password: '1234',
    password2: '1234',
    nickname: '쿠팡요정',
    phone: '010-1234-5678',
    email: 'user@coupang.com',
    ccode: 'C01'
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    console.log(`-> ${id}: ${value}`);
    setInput({
      ...input,
      [id]: value, 
    });
  }

  // 테스트 계정 데이터 확장
  const test = () => {
    setInput({
      username: '왕눈이',
      id: 'user1',   
      password: '1234',
      password2: '1234',
      nickname: '조장님',
      phone: '010-9876-5432',
      email: 'user1@coupang.com',
      ccode: 'C02'
    });
  }

  const [id_msg, setId_msg] = useState('');
  const [nick_msg, setNick_msg] = useState(''); // 💡 닉네임 중복검사 메시지 상태 추가
  const [password_msg, setPassword_msg] = useState('');

  const [checkId_sw, setCheckId_sw] = useState(false); 
  const [checkId_cnt, setCheckId_cnt] = useState(1);   

  const [checkNick_sw, setCheckNick_sw] = useState(false); // 💡 닉네임 중복체크 여부 플래그
  const [checkNick_cnt, setCheckNick_cnt] = useState(1);   // 💡 닉네임 중복 여부 (1: 중복)

  const checkId = () => {
    // if (input.id.length <4) {
    //   setId_msg('사용 가능한 아이디는 최소 4자 이상입니다.');
    //   enter_chk(e,'id');
    //   return;
    // }

    setCheckId_sw(true);
    console.log(`-> http://${getIP()}:9101/member/check_id?id=${input.id}`);
    axiosInstance.get(`/member/check_id?id=${input.id}`)
    .then(result => result.data)
    .then(data => {
      console.log('-> data:', data);
      if (data == 0) {
        setId_msg('사용 가능한 아이디 입니다.');
        setCheckId_cnt(0); 
      } else {
        setCheckId_cnt(1); 
        setId_msg('사용 불가능한 아이디 입니다.');
      }
    })
    .catch(err => console.error(err))
  }

  const checkNick = () => {
    setCheckNick_sw(true);
    console.log(`-> http://${getIP()}:9101/member/check_nick?nickname=${input.nickname}`);
    axiosInstance.get(`/member/check_nick?nickname=${input.nickname}`)
    .then(result => result.data)
    .then(data => {
      console.log('-> data:', data);
      if (data == 0) {
        setNick_msg('사용 가능한 닉네임 입니다.');
        setCheckNick_cnt(0); 
      } else {
        setCheckNick_cnt(1); 
        setNick_msg('사용 불가능한 닉네임 입니다.');
      }
    })
    .catch(err => console.error(err))
  }

  const navigate = useNavigate(); 

  const send = (e: React.SyntheticEvent) => {
    e.preventDefault(); 

    if (input.password !== input.password2) {
      setPassword_msg('입력된 패스워드가 일치하지 않습니다.');
    } else {
      if (checkId_sw == false) {
        setId_msg('중복 아이디를 체크해주세요.');
      } else if (checkId_cnt == 1) {
        setId_msg('아이디가 중복됩니다. 아이디를 다시 체크해주세요.');
      } else if (checkNick_sw == false) { // 💡 닉네임 체크 여부 검증 추가
        setNick_msg('중복 닉네임을 체크해주세요.');
      } else if (checkNick_cnt == 1) {
        setNick_msg('닉네임이 중복됩니다. 닉네임을 다시 체크해주세요.');
      } else {
        // 💡 백엔드 MemberDTO 규격 변수 이름(username, id, password, nickname, phone, email, ccode)으로 안전하게 매싱하여 전송
        axiosInstance.post(`/member/save`, {
          username: input.username,
          id: input.id,
          password: input.password,          
          nickname: input.nickname,          
          phone: input.phone,          
          email: input.email,          
          ccode: input.ccode,          
        })
        .then(result => result.data)
        .then(savedEntity => {
          console.log('-> 가입 완료 데이터:', savedEntity);
          alert('회원 가입에 성공하였습니다.');
          navigate('/member/find_all') // 가입 성공 후 목록화면으로 redirect
        })
        .catch(err => console.error(err))
      }
    }
  }

  return (
    <div>
      <div className='title_line'>사원 회원가입</div>
      <form onSubmit={send} style={{margin:'10px auto', width:'70%', textAlign:'left'}}>
        
        {/* 성명 (mname -> username) */}
        <div className="mb-3">
          <label className="form-label">성명</label>
          <input type="text" className="form-control form-control-sm" id="username" placeholder="성명"
                 onKeyDown={e=>enter_chk(e,'id')} onChange={onChange} value={input.username}
                 style={{width: '50%'}} autoFocus />
        </div>

        {/* 아이디 & 중복 검사 */}
        <div className="mb-3">
          <label className="form-label" style={{marginBottom: '0px'}}>아이디</label>
          <div className="d-flex justify-content-center">
            <input type="text" className="form-control form-control-sm" id="id" placeholder="아이디"
                   onKeyDown={e=>enter_chk(e,'btnCheckId')} onChange={onChange} value={input.id} 
                   style={{flex: 1, marginRight: '5px'}} />
            <button type='button' id='btnCheckId' onClick={checkId} 
                    className='btn btn-primary btn-sm'>중복 아이디 검사</button>         
          </div>
          <span style={{color: 'blue'}}>{id_msg}</span>
        </div>

        {/* 💡 신규 반영 컬럼: 별명(닉네임) & 중복 검사 */}
        <div className="mb-3">
          <label className="form-label" style={{marginBottom: '0px'}}>닉네임</label>
          <div className="d-flex justify-content-center">
            <input type="text" className="form-control form-control-sm" id="nickname" placeholder="닉네임"
                   onKeyDown={e=>enter_chk(e,'btnCheckNick')} onChange={onChange} value={input.nickname} 
                   style={{flex: 1, marginRight: '5px'}} />
            <button type='button' id='btnCheckNick' onClick={checkNick} 
                    className='btn btn-primary btn-sm'>중복 닉네임 검사</button>         
          </div>
          <span style={{color: 'blue'}}>{nick_msg}</span>
        </div>

        {/* 패스워드 */}
        <div className="mb-3">
          <label className="form-label" style={{marginTop: '5px'}}>패스워드</label>
          <input type="password" className="form-control form-control-sm" id="password" placeholder="패스워드"
                 onKeyDown={e=>enter_chk(e,'password2')} onChange={onChange} value={input.password}
                 style={{width: '50%'}} />
          <span style={{color: 'blue'}}>{password_msg}</span>
        </div>

        {/* 패스워드 확인 */}
        <div className="mb-3">
          <label className="form-label">패스워드 확인</label>
          <input type="password" className="form-control form-control-sm" id="password2" placeholder="패스워드 확인"
                 onKeyDown={e=>enter_chk(e,'phone')} onChange={onChange} value={input.password2}
                 style={{width: '50%'}} />
        </div>            

        {/* 💡 신규 반영 컬럼: 전화번호 */}
        <div className="mb-3">
          <label className="form-label">전화번호</label>
          <input type="text" className="form-control form-control-sm" id="phone" placeholder="전화번호"
                 onKeyDown={e=>enter_chk(e,'email')} onChange={onChange} value={input.phone}
                 style={{width: '50%'}} />
        </div>

        {/* 💡 신규 반영 컬럼: 이메일 */}
        <div className="mb-3">
          <label className="form-label">메일 주소</label>
          <input type="email" className="form-control form-control-sm" id="email" placeholder="이메일 주소"
                 onKeyDown={e=>enter_chk(e,'ccode')} onChange={onChange} value={input.email}
                 style={{width: '50%'}} />
        </div>

        {/* 💡 신규 반영 컬럼: 쿠코드 */}
        <div className="mb-3">
          <label className="form-label">쿠코드 (센터 코드)</label>
          <input type="text" className="form-control form-control-sm" id="ccode" placeholder="쿠코드"
                 onKeyDown={e=>enter_chk(e,'btnSend')} onChange={onChange} value={input.ccode}
                 style={{width: '50%'}} />
        </div>

        <div style={{textAlign:'center', marginTop: '25px'}}>              
          <button id='btnSend' type="submit" className="btn btn-primary btn-sm" style={{marginRight:'10px'}}>회원가입</button>
          <button id='btnTest' type="button" className="btn btn-primary btn-sm" onClick={test}>테스트 계정 데이터 세팅</button>
        </div>
      </form>
    </div>
  )
}

export default Signup;