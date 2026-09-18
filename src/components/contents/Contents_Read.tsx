import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import {enter_chk, axiosInstance, getIP, getYoutubeId, isImage, download,
        extractKakaoMapInfo, splitKakaoMapString} from '../Tool'
import Contents_List_all from './Contents_List_all';
import none1_img from '../../assets/images/none1.png';

import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';

const Contents_Read = () => {
  const navigate = useNavigate();

  // onClick={() => navigate(`/contents/read/${item.contentsno}?page=${page}&word=${word}`)}
  const {contentsno} = useParams();
  console.log('-> contentsno:', contentsno);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? 0);
  const word = String(searchParams.get('word') ?? '');
  const size = Number(searchParams.get('size') ?? 0);

  const [cate, setCate] = useState<CateType>({});
  const [data, setData] = useState<ContentsType>({});

  const [imgSrc, setImgSrc] = useState<string>('');

  const [map_array, setMap_array] = useState<string[]>([]);

  useEffect(
    () => {
      if (!contentsno) return; // 주소창 파라미터가 없을 때의 예외 처리

      axiosInstance.get(`/contents/read/${contentsno}`) // 글 내용 조회
      .then(result => result.data)
      .then(data => {
        setData(data);
        console.log('-> data:', data);
        console.log('-> data.youtube:', data.youtube);

        // 🎯 [수정] 서버에서 받아온 문자열 지도를 배열로 쪼개어 상태에 세팅합니다.
        if (data.map) {
          setMap_array(splitKakaoMapString(data.map));
        }

        axiosInstance.get(`/cate/${data.cateno}`) // 카테고리 정보 조회
        .then(result => result.data)
        .then(data => {
          setCate(data);
          console.log('-> cate data:', data);
        })
        .catch(err => console.error(err));

        if (data.file1saved && isImage(data.file1)) {
          setImgSrc(`http://${getIP()}:9100/contents/storage/${data.file1saved}`);
        } else {
          setImgSrc(none1_img);
        }

      })
      .catch(err => console.error(err));
    }, [contentsno] // 🎯 [수정] 의존성 배열에 contentsno를 넣어 렌더링 시점을 동기화합니다.
  );

  // 2) 약도 렌더 (map_array가 준비된 뒤 실행)
  useEffect(() => {
    if (map_array.length !== 3) return;
    console.log('------> map_array: ' + map_array);
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

    const renderMap = async () => {
      await ensureScript();

      // <div style={{ margin: "0.5% auto", width: '670' }}>
      //   <div
      //     id={map_array[0]}
      //     className="root_daum_roughmap root_daum_roughmap_landing"
      //   />
      // </div>

      // 컨테이너가 실제 DOM에 존재하는지 확인
      const map_tag = document.getElementById(containerId);
      if (!map_tag) return;

      map_tag.innerHTML=''; // useEffect()등이 반복 호출되어 지도가 중복해서 그려지는 것을 방지

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

  }, [map_array]);

  return (
    <div className='content'>
      <div className='title_line_left' >{cate.grp} &gt; {cate.name}</div>
      <aside className="aside_right">
        <Link to={`/contents/list/${cate.cateno}?page=${page}&word=${word}`}>목록형</Link>
        <span className='aside_menu_divide'>|</span>
        <Link to={`/contents/list_gallery/${cate.cateno}?page=${page}&word=${word}`}>갤러리형</Link>
        <span className='aside_menu_divide'>|</span>
        <Link to={`/contents/update_text/${data.contentsno}`}>글 수정</Link>
        <span className='aside_menu_divide'>|</span>
        <Link to={`/contents/update_file1/${data.contentsno}`}>파일 수정</Link>
        <span className='aside_menu_divide'>|</span>
        <Link to={`/contents/youtube/${data.contentsno}?page=${page}&word=${word}`}>Youtube 관리</Link>
        <span className='aside_menu_divide'>|</span>    
        <Link to={`/contents/map/${data.contentsno}?page=${page}&word=${word}`}>지도 관리</Link>
        <span className='aside_menu_divide'>|</span>  
        <Link to={`/contents/create/${cate.cateno}`}>등록</Link>
        <span className='aside_menu_divide'>|</span>
        <Link to={`/contents/delete/${data.contentsno}?page=${page}&word=${word}&size=${size}`}>삭제</Link>
        <span className='aside_menu_divide'>|</span>
        <a href='javascript: location.reload()'>새로고침</a>
      </aside>
      <div className='aside_menu_line'></div>
      {/* 본문, http://localhost:9100/contents/storage/xmas02.jpg */}
      <fieldset className="fieldset_basic">
        <ul>
          <li className="li_none">
            <div style={{ width: "100%", wordBreak: "break-all" }}>
              <img
                src={imgSrc}
                alt=""
                style={{ width: "50%", float: "left", marginTop: "0.5%", marginRight: "1%" }}
              />
              <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>{data.title}</span>
              <span style={{ fontSize: "1em", marginLeft: 8 }}>{data.rdate}</span>
              <br /><br />
              <div style={{ whiteSpace: "pre-wrap", textAlign: 'left' }}>{data.content}</div>
            </div>
          </li>

          <li className="li_none_left">검색어(키워드): {data.word}</li>

          {/* 첨부 파일, 관계 연산자 -> 논리 연산자, data.size1 갑이 없으면 undefined 발생하여 연산 에러
          (data.size1 !== undefined) && (data.size1 > 0) && (
          또는
          (data?.size1 ?? 0) > 0 &&: data.size1이 없으면 0을 할당하여 연산 처리
          */}
          {(data?.size1 ?? 0) > 0 && (
            <li className="li_none_left">
              <div>
                첨부 파일: 
                <a href='#' onClick={(e) => { e.preventDefault(); download('contents', `${data.file1saved}`, `${data.file1}`);}}>
                  {data.file1}
                </a>{" "}
                <span>({data.size1_label})</span> 
                <a href='#' onClick={(e) => { e.preventDefault(); download('contents', `${data.file1saved}`, `${data.file1}`);}}>
                  <img src="/src/assets/images/download.png" alt="download" />
                </a>
              </div>
            </li>
          )}
        </ul>
      </fieldset>

      <div style={{ margin: "20px auto 50px auto", width: "50%", marginTop: "0.5%"}}>
        {data.youtube ? (
          <div style={{ position: 'relative', paddingBottom: '80%', height: 0 }}> {/* 🎯 56.25% → 80%로 변경 */}
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(data.youtube)}`}
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
        ):(<div />)
      }
      </div>

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

    </div>
  )
}

export default Contents_Read

