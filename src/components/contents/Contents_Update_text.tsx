import React, { useEffect, useState, type ChangeEvent } from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import {enter_chk, axiosInstance} from '../Tool.ts'
import SimpleModal, {type SimpleModalTypePayload} from '../SimpleModal.tsx';

import type CateType from '../cate/CateType.ts';
import type ContentsType from './ContentsType.ts';

const Contents_Update_text = () => {
  // -------------------------------------------------------------------------------
  // SimpleModal
  // -------------------------------------------------------------------------------
  // 1. SimpleModalTypePayload 대신 명시적으로 엄격한 타입을 지정해 줍니다.
  const [modal, setModal] = useState<SimpleModalTypePayload>({
    show: false,
    title: '',
    message: '',
    onConfirm: undefined, 
  });

  // 2. 메시지창 출력
  const openModal = (payload: SimpleModalTypePayload) => setModal({ 
    show: true, 
    title: payload.title, 
    message: payload.message, 
    // payload.onConfirm이 null일 경우 undefined로 변환하여 에러 방지
    onConfirm: payload.onConfirm ?? undefined 
  });
 
  // 최신값을 반영하여 창 닫기
  const closeModal = () => setModal((modal) => ({ ...modal, show: false })); 
  // -------------------------------------------------------------------------------

  const navigate = useNavigate();

  const {contentsno} = useParams(); // 수정할 글 번호 수집
  console.log('-> contentsno:', contentsno);

  const [cate, setCate] = useState<CateType>({});
  const [input, setInput] = useState<ContentsType>(
    {
      contentsno:0,
      title: '',
      content: '',
      word: '',
      password: '1234',
    }    
  );

  useEffect(
    () => {
      // 수정할 내용을 일어옴.
      axiosInstance.get(`/contents/read/${contentsno}`)
      .then(result => result.data)
      .then(data => {
        console.log('-> data:', data);
        
        // password는 초기값 사용
        setInput(input => ({
          ...input,
          contentsno: data.contentsno,
          title: data.title || '',
          content: data.content || '',
          word: data.word || '',
        }));

        axiosInstance.get(`/cate/${data.cateno}`)
        .then(result => result.data)
        .then(data => {
          setCate(data);          
          console.log('-> cate data:', data);
        })
        .catch(err => console.error(err));

      })
      .catch(err => console.error(err));
    }, [contentsno]
  );
 
  // e.target: event가 발생한 태그
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {id, value} = e.target;
    setInput({...input,  [id]: value});
  }

  // 파일 전송 완료를 기다려야 함으로 동기 통신을 지정
  const send = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('title', String(input.title));
    formData.append('content', String(input.content));
    formData.append('word', String(input.word));
    formData.append('password', String(input.password));

    try {
      const response = await axiosInstance.post(`/contents/update_text`, formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // if (response.status === 401) {
      //   alert('업로드 권한이 없습니다.\n관리자로 다시 로그인 해주세요.');
      //   return;
      // } else if (response.status !== 200) {
      //   alert('처리에 실패했습니다.\n다시 시도해주세요.');
      //   return;
      // }

      // const result = await response.text(); // fetch
      const result = Number(response.data); // axios
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show: true, 
          title: '수정 실패',
          message: '글 수정에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        openModal({
          show: true, 
          title: '수정 성공',
          message: '글 수정에 성공 했습니다.',
          onConfirm: () => navigate(`/contents/list/${cate.cateno}`)
        });
        
      } else if (result == 2) {
        openModal({
          show: true, 
          title: '패스워드 일치하지 않음',
          message: '패스워드 일치하지 않습니다. 다시 시도해주세요.',
        });
      } 

    } catch (err) {
      console.error(err);
      openModal({
        show: true, 
        title: '네트워크 오류',
        message: '네트워크 오류가 발생했습니다.\n다시 시도해주세요.',
      });
    }
  }

  return (
    <div className='content'>
      <div className='title_line_left' >{cate.grp} &lt; {cate.name}</div>
      <aside className='aside_right'>
        <Link to={`/contents/create/${cate.cateno}`}>등록</Link>
        <span className='aside_menu_divide'>|</span>
        <a href='#' onClick={() => location.reload()}>새로고침</a>
      </aside>
      <div className='aside_menu_line'></div> 

      {/* 수정 폼 */}
      <form onSubmit={send}>
        <input type="hidden" name="contentsno" value={input.contentsno} />

        {/* 제목 */}
        <div className='input_div'>
          <label className="form-label">제목</label>
          <input type="text" name="title" id='title' value={input.title}
                 onChange={onChange} required autoFocus
                 onKeyDown={e=>enter_chk(e,'content')}
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
            onKeyDown={e=>enter_chk(e,'password')}
            required className="form-control"
            style={{ flex: 1 }}
          />
        </div>

        {/* 패스워드 */}
        <div className='input_div'>
          <label>패스워드</label>
          <input
            type="password" name="password" id='password'
            value={input.password} 
            onChange={onChange} required
            onKeyDown={e=>enter_chk(e,'btn_send')}
            className="form-control" style={{ flex: 1 }}
          />
        </div>

        <div className="content_body_bottom" style={{ textAlign: 'center', marginTop: 10 }}>
          <button type="submit" id='btn_send' 
                  className="btn btn-outline-secondary btn-sm">
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate(`/contents/list/${cate.cateno}`)}
            className="btn btn-outline-secondary btn-sm"
            style={{ marginLeft: '8px' }}
          >
            취소
          </button>
        </div>

      </form>
      {/* 모달 */}
      <SimpleModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm || closeModal}
      />   
    </div>

  )
}

export default Contents_Update_text

