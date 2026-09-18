import { useEffect, useState, type ChangeEvent, type MouseEvent } from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import {enter_chk, axiosInstance, getIP, getYoutubeId} from '../Tool'
import SimpleModal, {type SimpleModalTypePayload} from '../SimpleModal.tsx';

import type CateType from '../cate/CateType.ts';
import type ContentsType from './ContentsType.ts';

import none1_img from '../../assets/images/none1.png';

const Contents_Youtube = () => {
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

  const {contentsno} = useParams();
  console.log('-> contentsno:', contentsno);

  const [cate, setCate] = useState<CateType>({});
  const [input, setInput] = useState<ContentsType>(
    {
      contentsno:0,
      title: '',
      password: '1234',
      youtube: '',

    }    
  );

  useEffect(
    () => {
      axiosInstance.get(`/contents/read/${contentsno}`)
      .then(result => result.data)
      .then(data => {
        console.log('-> data:', data);
        
        // password는 초기값 사용
        setInput(input => ({
          ...input,
          contentsno: data.contentsno,
          title: data.title || '',
          youtube: data.youtube,
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

  // youtube 수정
  const send_update_youtube = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', String(input.password));
    formData.append('youtube', String(input.youtube));

    try {
      const response = await axiosInstance.put(`/contents/youtube`, formData);
      const result = Number(response.data); // axios
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show: true, 
          title: 'Youtube 수정 실패',
          message: 'Youtube 수정에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        openModal({
          show: true, 
          title: 'Youtube 수정 성공',
          message: 'Youtube 수정에 성공 했습니다.',
          onConfirm: () => navigate(`/contents/read/${input.contentsno}`)
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

  // youtube 삭제
  const send_delete_youtube = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', String(input.password));
    formData.append('youtube', '');

    try {
      const response = await axiosInstance.put(`/contents/youtube`, formData);
      const result = Number(response.data); // axios
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show: true, 
          title: 'Youtube 실패',
          message: 'Youtube 삭제에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        setInput(input => ({
          ...input,
          youtube: '',
        }));

        openModal({
          show: true, 
          title: 'Youtube 삭제 성공',
          message: 'Youtube 삭제에 성공 했습니다.',
          onConfirm: () => navigate(`/contents/read/${input.contentsno}`)
        });
        
      } else if (result == 2) {
        openModal({
          show: true, 
          title: '패스워드 일치하지 않음',
          message: '패스워드 일치하지 않습니다. 다시 시도해주세요.',
        });

      } else if (result == 3) {
        openModal({
          show: true, 
          title: '기본 이미지 파일 삭제 오류',
          message: '기본 이미지 파일은 삭제 할 수 없습니다.',
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
      <div className='title_line_left' >{cate.grp} &gt; {cate.name}</div>
      <aside className='aside_right'>
        <Link to={`/contents/read/${input.contentsno}`}>조회</Link>
        <span className='aside_menu_divide'>|</span>        
        <Link to={`/contents/create/${cate.cateno}`}>등록</Link>
        <span className='aside_menu_divide'>|</span>
        <a href='#' onClick={() => location.reload()}>새로고침</a>
      </aside>
      <div className='aside_menu_line'></div> 

      <fieldset className="fieldset_basic">
        <ul>
          <li className="li_none">
            <div style={{ width: "50%", float: "left", marginTop: "0.5%", marginRight: "1%" }}>
              {input.youtube ? (
                <div style={{ position: 'relative', paddingBottom: '80%', height: 0 }}> {/* ? 56.25% → 80%로 변경 */}
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(input.youtube)}`}
                    title="YouTube player"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%', // 부모 높이에 맞게 자동 확장
                      border: 'none'
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ):(
                <img
                  src={none1_img}
                  alt=""
                  style={{ width: "100%"}}
                />
              )
            }
            </div>

            <div style={{textAlign: 'left', width: '47%', float: 'left', marginBottom: '60px'}}>
              <div style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: '30px' }}>{input.title}</div>
              
              <textarea name="youtube" id='youtube' autoFocus 
                value={input.youtube}
                onChange={onChange} required 
                className="form-control"
                rows={8} style={{ flex: 1 }}
              />

              <label>패스워드</label>
              <input
                type="password" name="password" id='password'
                value={input.password} 
                onChange={onChange} required
                onKeyDown={e=>enter_chk(e,'btn_send')}
                className="form-control" style={{ flex: 1 }}
              />
            </div>            
            
            <div style={{ whiteSpace: "pre-wrap", textAlign: 'center' }}>
              <button type="submit" id='btn_send' 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={(e) => send_update_youtube(e)} style={{marginRight: '5px'}}>
                Youtube 변경 처리
              </button>
              <button type="submit" id='btn_send' 
                      className="btn btn-outline-secondary btn-sm" 
                      onClick={(e) => send_delete_youtube(e)} style={{marginRight: '5px'}}>
                Youtube 삭제
              </button>
              <button
                type="button"
                onClick={() => navigate(`/contents/read/${input.contentsno}`)}
                className="btn btn-outline-secondary btn-sm"
              >
                취소
              </button>
            </div>
          </li>

        </ul>
      </fieldset>

      <div>youtube 주소 가져오는 방법</div> 
      <div style={{margin: '20px auto 50px auto'}}>
        <img src='/src/assets/images/youtube_help.jpg' />        
      </div>


      {/* 모달 */}
      <SimpleModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={modal.onConfirm || closeModal}
        onConfirm={modal.onConfirm || closeModal}
      />   
    </div>

  )
}

export default Contents_Youtube
