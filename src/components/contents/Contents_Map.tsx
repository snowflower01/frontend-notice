import { useEffect, useState, type ChangeEvent, type MouseEvent  } from 'react'
import {useParams, useNavigate, Link} from 'react-router-dom'
import {enter_chk, axiosInstance, getIP, getYoutubeId, 
        extractKakaoMapInfo, splitKakaoMapString} from '../Tool'
import SimpleModal, {type SimpleModalTypePayload} from '../SimpleModal.tsx';

import type CateType from '../cate/CateType.ts';
import type ContentsType from './ContentsType.ts';

import none1_img from '../../assets/images/none1.png';

const Contents_Map = () => {
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
      map: '',

    }    
  );

  // ['daumRoughmapContainer1762844822269', '1762844822269', '/cz5r74kh84j']
  const [map_array, setMap_array] = useState<string[]>([]);

  useEffect(
    () => {
      axiosInstance.get(`/contents/read/${contentsno}`)
      .then(result => result.data)
      .then(data => {
        console.log('-> data:', data);
        
        // password는 초기값 사용
        // map: daumRoughmapContainer1762844822269/1762844822269/cz5r74kh84j
        setInput(input => ({
          ...input,
          contentsno: data.contentsno,
          title: data.title || '',
          map: data.map,
        }));

        // ["daumRoughmapContainer1762848321274", "1762848321274", "cz89ag36uw3"]
        setMap_array(splitKakaoMapString(data.map));  

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

  // 2) 약도 렌더 (map_array가 준비된 뒤 실행)
  useEffect(() => {
    // ['daumRoughmapContainer1762844822269', '1762844822269', '/cz5r74kh84j']
    if (map_array.length !== 3) return;

    const [containerId, timestamp, key] = map_array;

    const loaderSrc = "https://ssl.daumcdn.net/dmaps/map_js_init/roughmapLoader.js";
    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${loaderSrc}"]`)) return resolve();
        const s = document.createElement("script");
        s.src = loaderSrc;
        s.charset = "UTF-8";
        s.onload = () => resolve();
        s.onerror = reject;
        document.body.appendChild(s);
      });

    // 지도 그리기
    const renderMap = async () => {
      await ensureScript();

      // <div style={{ margin: "0.5% auto", width: '670' }}>
      //   <div
      //     id={map_array[0]}
      //     className="root_daum_roughmap root_daum_roughmap_landing"
      //   />
      // </div>

      // 컨테이너가 실제 DOM에 존재하는지 확인
      const el = document.getElementById(containerId);
      if (!el) return;

      // 중복 렌더 방지 (필요 시)
      // el.innerHTML = '';
      // window as any: window 객체는 타입 검사를 하지 말 것. 
      new (window as any).daum.roughmap.Lander({
        timestamp,
        key,
        mapWidth: "100%",
        mapHeight: "360",
      }).render();
    };

    renderMap();

    // 지도를 출력한다음 삭제
    setInput(input => ({
      ...input,
      map: '',
    }))

  }, [map_array]);

  // e.target: event가 발생한 태그
  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {id, value} = e.target;
    setInput({...input,  [id]: value});
  }

  // map 수정
  const send_update_map = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', String(input.password));

    let extract_map = extractKakaoMapInfo(String(input.map));
    formData.append('map', extract_map);

    try {
      const response = await axiosInstance.put(`/contents/map`, formData);
      const result = Number(response.data); // axios
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show: true,
          title: '지도 수정 실패',
          message: '지도 수정에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        openModal({
          show: true,
          title: '지도 수정 성공',
          message: '지도 수정에 성공 했습니다.',
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
  const send_delete_map = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', String(input.password));
    formData.append('map', '');

    try {
      const response = await axiosInstance.post(`/contents/map`, formData);
      const result = Number(response.data); // axios
      console.log('서버 응답:', result);

      if (result == 0) {
        openModal({
          show: true,
          title: '지도 실패',
          message: '지도 삭제에 실패 했습니다. 다시 시도해주세요.',
        });
      } else if (result == 1) {
        setInput(input => ({
          ...input,
          map: '',
        }));

        openModal({
          show: true,
          title: '지도 삭제 성공',
          message: '지도 삭제에 성공 했습니다.',
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

  // if (map_array.length == 0) return null;

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

      <div style={{ marginLeft: '27%', marginTop: "0.5%" }}>
        {map_array.length === 3 && (
          <div style={{ margin: "0.5% auto", width: '670' }}>
            <div
              id={map_array[0]}
              className="root_daum_roughmap root_daum_roughmap_landing"
            />
          </div>
        )}

      </div>

      <div style={{margin: '10px auto', width: '670px', textAlign: 'left'}}>
        <div style={{ fontSize: "1.5em", fontWeight: "bold", marginBottom: '30px' }}>{input.title}</div>
        
        <textarea name="map" id='map' autoFocus 
          value={input.map}
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
                onClick={(e) => send_update_map(e)} style={{marginRight: '5px'}}>
          지도 변경 처리
        </button>
        <button type="submit" id='btn_send' 
                className="btn btn-outline-secondary btn-sm" 
                onClick={(e) => send_delete_map(e)} style={{marginRight: '5px'}}>
          지도 변경 삭제
        </button>
        <button
          type="button"
          onClick={() => navigate(`/contents/read/${input.contentsno}`)}
          className="btn btn-outline-secondary btn-sm"
        >
          취소
        </button>
      </div>

      <div>[참고]  지도 가져오는 방법</div> 
      <div style={{margin: '20px auto 50px auto'}}>

      </div>


      {/* 모달 */}
      <SimpleModal
        show={modal.show}
        title={modal.title}
        message={modal.message}
        onClose={modal.onConfirm || closeModal}
        onConfirm={modal.onConfirm || closeModal}
      />
      
      <div>[참고] Daum 지도 가져오는 방법</div> 
      <div style={{margin: '20px auto 50px auto'}}>
        <div><img src='/src/assets/images/map01.jpg' /></div>
        <div><img src='/src/assets/images/map02.jpg' /></div>
        <div><img src='/src/assets/images/map03.jpg' /></div>
        <div><img src='/src/assets/images/map04.jpg' /></div>
        <div><img src='/src/assets/images/map05.jpg' /></div>        
      </div>

      <div>[참고] Google 지도 가져오는 방법</div> 
      <div style={{margin: '20px auto 50px auto'}}>
        <div><img src='/src/assets/images/google01.jpg' /></div>
        <div><img src='/src/assets/images/google02.jpg' /></div>
        <div><img src='/src/assets/images/google03.jpg' /></div>
        <div><img src='/src/assets/images/google04.jpg' /></div>     
      </div>

    </div>

  )
}

export default Contents_Map
