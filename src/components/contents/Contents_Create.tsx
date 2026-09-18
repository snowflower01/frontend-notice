import React, { useEffect, useState, type ChangeEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { enter_chk, axiosInstance } from '../Tool'
import { GlobalStoreSession } from '../../store/store'
import type CateType from '../cate/CateType'

const Contents_Create = () => {
  // 🎯 [교정] Zustand 가이드에 맞게 셀렉터 형태로 memberno 상태를 안전하게 구독합니다.
  const memberno = GlobalStoreSession((state) => state.memberno);
  const navigate = useNavigate();

  const { cateno } = useParams();
  console.log('-> cateno:', cateno);

  const [cate, setCate] = useState<CateType>({});

  useEffect(
    () => {
      axiosInstance.get(`/cate/${cateno}`)
      .then(result => result.data)
      .then(data => {
        setCate(data);
        console.log('-> cate data:', data);
      })
      .catch(err => console.error(err));

    }, [cateno]
  );

  // 상태 객체 사용 (원본 유지)
  const [input, setInput] = useState(
    {
      title: '제목',
      content: '내용',
      word: '검색',
      password: '1234',
    }    
  );
  
  // e.target: event가 발생한 태그 (원본 유지)
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> ) => {
    const { id, value } = e.target;
    setInput({ ...input, [id]: value });
  }

  const [file, setFile] = useState<File | null>(null); // 이미지 파일

  // 파일 전송 완료를 기다려야 함으로 동기 통신을 지정
 // 📝 Contents_Create.tsx 내부 send 함수 최종 조율

 // 📝 Contents_Create.tsx 내부 send 함수 원상복구

  const send = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    console.log('-> 복구 확인 memberno:', memberno); // 이제 99가 아니라 로그인한 번호가 찍혀야 합니다.
    console.log('-> 복구 확인 cateno:', cateno);

    const formData = new FormData();
    
    // 🎯 [원상복구] 강제 고정했던 '5'를 지우고, 로그인한 사원의 번호를 동적으로 전달합니다.
    // 물고기가 고래가 되지 않게 유저님의 원본 변수 형태를 그대로 살립니다.
    formData.append('memberno', String(memberno)); // 이제 진짜 로그인한 사원번호가 들어갑니다!
    formData.append('cateno', String(cateno));     // 11번 진열 카테고리 그대로 연동
    
    formData.append('title', input.title);
    formData.append('content', input.content);
    formData.append('word', input.word);
    formData.append('password', input.password);
    if (file) formData.append('file1MF', file);

    // ... 이하 동일 (axios.post 로직)

    try {
      const response = await axiosInstance.post(`/contents/create`, formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 401) {
        alert('업로드 권한이 없습니다.\n관리자로 다시 로그인 해주세요.');
        return;
      } else if (response.status !== 200) {
        alert('업로드에 실패했습니다.\n다시 시도해주세요.');
        return;
      }

      const result = await response.data;
      console.log('서버 응답:', result);
      
      // 등록 성공 후 원하셨던 11번 진열 목록 화면으로 깔끔하게 리다이렉트
      navigate("/contents/list_all/" + cateno);

    } catch (err) {
      console.error('네트워크 오류:', err);
      alert('네트워크 오류가 발생했습니다.\n다시 시도해주세요.');
    }
  }

  return (
    <div className='content'>
      <div className='title_line_left' >{cate.grp} 〉 {cate.name}</div>
      <aside className='aside_right'>
        <Link to={`/contents/create/${cate.cateno}`}>등록</Link>
        <span className='aside_menu_divide'>|</span>
        <a href='javascript: location.reload()'>새로고침</a>
      </aside>
      <div className='aside_menu_line'></div> 

      {/* 입력 폼 */}
      <form onSubmit={send} encType="multipart/form-data">
        <input type="hidden" name="cateno" value={cateno} />

        {/* 제목 */}
        <div className='input_div'>
          <label className="form-label">제목</label>
          <input type="text" name="title" id='title' value={input.title}
                 onChange={onChange} required autoFocus
                 onKeyDown={e => enter_chk(e, 'content')}
                 className="form-control" style={{ flex: 1 }}
          />
        </div>

        {/* 내용 */}
        <div className='input_div'>
          <label>내용</label>
          <textarea name="content" id='content' 
            value={input.content}
            onChange={onChange} required 
            className="form-control"
            rows={6} style={{ flex: 1 }}
          />
        </div>

        {/* 검색어 */}
        <div className='input_div'>
          <label>검색어</label>
          <input
            type="text" name="word" id='word' 
            value={input.word}
            onChange={onChange} 
            onKeyDown={e => enter_chk(e, 'file1MF')}
            required className="form-control"
            style={{ flex: 1 }}
          />
        </div>

        {/* 이미지 */}
        <div className='input_div'>
          <label>이미지</label>
          <input
            type="file" name="file1MF" id="file1MF"
            className="form-control" style={{ flex: 1 }}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* 패스워드 */}
        <div className='input_div'>
          <label>패스워드</label>
          <input
            type="password" name="password" id='password'
            value={input.password} 
            onChange={onChange} required
            onKeyDown={e => enter_chk(e, 'btn_send')}
            className="form-control" style={{ flex: 1 }}
          />
        </div>

        <div className="content_body_bottom" style={{ textAlign: 'center', marginTop: 10 }}>
          <button type="submit" id='btn_send' 
                  className="btn btn-outline-secondary btn-sm">
            등록
          </button>
          <button
            type="button"
            onClick={() => navigate(`/contents/list_all/${cateno}`)}
            className="btn btn-outline-secondary btn-sm"
            style={{ marginLeft: '8px' }}
          >
            목록
          </button>
        </div>

      </form>

    </div>

  )
}

export default Contents_Create