import { useEffect, useState, type ChangeEvent, type MouseEvent, type KeyboardEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { enter_chk, axiosInstance, getIP , isImage} from '../Tool'
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

  // useParams의 제네릭 명시
  const { contentsno } = useParams();
  console.log('-> contentsno:', contentsno);

  const [cate, setCate] = useState<CateType>({});
  const [input, setInput] = useState<ContentsType>(
    {
      contentsno:0,
      title: '',
      content: '',
      word: '',
      password: '1234',
      file1: '',
      file1saved: '',
    }    
  );

  // null 허용 파일 타입 설정
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // if (!contentsno) return; // 안정성 확보

    axiosInstance.get(`/contents/read/${contentsno}`)
      .then(result => result.data)
      .then(data => {
        console.log('-> data:', data);
        
        setInput(input => ({
          ...input,
          contentsno: data.contentsno,
          title: data.title || '',
          file1: data.file1,
          file1saved: data.file1saved,
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
  }, [contentsno]);
 
  // e.target에 대한 타입 명시
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setInput({ ...input, [id]: value });
  }

  const send_update_file1 = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', String(input.password));
    if (file) formData.append('file1MF', file);

    try {
      const response = await axiosInstance.post(`/contents/update_file1`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = Number(response.data);
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show: true,
          title: '파일 수정 실패',
          message: '파일 수정에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        openModal({
          show:true,
          title: '파일 수정 성공',
          message: '파일 수정에 성공 했습니다.',
          onConfirm: () => navigate(`/contents/read/${input.contentsno}`)
        });
      } else if (result == 2) {
        openModal({
          show:true,
          title: '패스워드 일치하지 않음',
          message: '패스워드 일치하지 않습니다. 다시 시도해주세요.',
        });
      } 

    } catch (err) {
      console.error(err);
      openModal({
        show:true,
        title: '네트워크 오류',
        message: '네트워크 오류가 발생했습니다.\n다시 시도해주세요.',
      });
    }
  }

  const send_delete_file1 = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', String(input.password));

    try {
      const response = await axiosInstance.post(`/contents/delete_file1`, formData);
      const result = Number(response.data);
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show:true,
          title: '파일 삭제 실패',
          message: '파일 삭제에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        setInput(input => ({
          ...input,
          file1: 'none1.png',
          file1saved: 'none1.png',
        }));

        openModal({
          show:true,
          title: '파일 삭제 성공',
          message: '파일 삭제에 성공 했습니다.',
          onConfirm: () => navigate(`/contents/read/${input.contentsno}`)
        });
        
      } else if (result == 2) {
        openModal({
          show:true,
          title: '패스워드 일치하지 않음',
          message: '패스워드 일치하지 않습니다. 다시 시도해주세요.',
        });
      } else if (result == 3) {
        openModal({
          show:true,
          title: '기본 이미지 파일 삭제 오류',
          message: '기본 이미지 파일은 삭제 할 수 없습니다.',
        });
      } 

    } catch (err) {
      console.error(err);
      openModal({
        show:true,
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
        <a href='#' onClick={(e) => { e.preventDefault(); location.reload(); }}>새로고침</a>
      </aside>
      <div className='aside_menu_line'></div> 

      <fieldset className="fieldset_basic">
        <ul>
          <li className="li_none">
            <div style={{ width: "100%", wordBreak: "break-all" }}>
              {isImage(input.file1) && (
                <img
                  src={`http://${getIP()}:9100/contents/storage/${input.file1saved}`}
                  alt=""
                  style={{ width: "50%", float: "left", marginTop: "0.5%", marginRight: "1%" }}
                />
              )}
            </div>

            <div style={{textAlign: 'left', width: '47%', float: 'left', marginBottom: '60px'}}>
              <div style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: '30px' }}>{input.title}</div>
              
              <input
                type="file" name="file1MF" id="file1MF"
                className="form-control" style={{ flex: 1 }}
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />

              <label>패스워드</label>
              <input
                type="password" name="password" id='password'
                value={input.password} 
                onChange={onChange} required
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => enter_chk(e,'btn_send')}
                className="form-control" style={{ flex: 1 }}
              />
            </div>            
            
            <div style={{ whiteSpace: "pre-wrap", textAlign: 'center' }}>
              <button type="button" id='btn_send_update' 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={send_update_file1} style={{marginRight: '5px'}}>
                파일 변경 처리
              </button>
              <button type="button" id='btn_send_delete' 
                      className="btn btn-outline-secondary btn-sm" 
                      onClick={send_delete_file1} style={{marginRight: '5px'}}>
                파일 삭제
              </button>
              <button
                type="button"
                onClick={() => navigate(`/contents/list/${cate.cateno}`)}
                className="btn btn-outline-secondary btn-sm"
              >
                취소
              </button>
            </div>
          </li>
        </ul>
      </fieldset>

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

export default Contents_Update_text