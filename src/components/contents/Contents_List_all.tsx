import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance, getIP, isImage } from '../Tool';
import { GlobalStoreSession } from '../../store/store.ts'; 

import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';

import none1_img from '../../assets/images/none1.png';

const Contents_List_all = () => {
  const { login, grade } = GlobalStoreSession();
  const navigate = useNavigate();

  // useParams에서 가져오는 값은 string | undefined 타입입니다.
  // <Route path='/contents/list/:cateno' element={<Contents_List_all />} />
  const { cateno } = useParams<{ cateno: string }>();
  console.log('-> cateno:', cateno);

  // 3. useState에 타입 지정 (초기값 빈 객체 및 빈 배열)
  const [cate, setCate] = useState<CateType>({}); // 그룹 정보 저장 객체
  const [data, setData] = useState<ContentsType[]>([]); // 글목록 저장 객체
  
  useEffect(() => {
    if (!cateno) return; // cateno가 없을 경우 API 요청 방지 (컴파일러 최적화)

    // 그룹 정보 수집
    axiosInstance.get(`/cate/${cateno}`)
      .then(result => result.data)
      .then((data) => {
        setCate(data);
        console.log('-> cate data:', data);
      })
      .catch(err => console.error(err));

    axiosInstance.get(`/contents/list_all/${cateno}`)
      .then(result => result.data)
      .then((data) => {
        setData(data);
        console.log('-> data:', data);
      })
      .catch(err => console.error(err));
  }, [cateno]);

  return (
    <div className='content'>
      <div className='title_line_left' >{cate.grp} &gt; {cate.name}</div>
      <aside className="aside_right">
        {(login === true && grade <= 5) ? (
          <>
            <Link to={`/contents/create/${cate.cateno}`}>등록</Link>
            <span className='aside_menu_divide'>|</span>
          </>
        ):(<></>)}  
        {/* href='javascript:...' 구조는 TSX/React에서 경고를 발생시키므로 버튼이나 아래 window.location 방식을 권장합니다 */}
        <a href="#!" onClick={(e) => { e.preventDefault(); window.location.reload(); }}>새로고침</a>
      </aside>
      <div className='aside_menu_line'></div>

      <table className="table table-striped" style={{ width: '100%' }}>
        <colgroup>
          <col style={{ width: '10%' }} />
          <col style={{ width: '90%' }} />
        </colgroup>
        <thead>
          <tr>
            <th className='th_bs'>파일</th>
            <th className='th_bs'>제목</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.contentsno}
              onClick={() => navigate(`/contents/read/${item.contentsno}`)}
              style={{ cursor: 'pointer' }}
            >
              <td className='td_basic'>
                <img src={item.file1saved && isImage(item.file1) ? (
                           `http://${getIP()}:9101/contents/storage/${item.thumb1}`
                           ):(none1_img)
                         } 
                alt={item.title} // 필수 웹 접근성 속성 추가
                style={{width: '200px', height: '120px'}} />
              </td>
              <td className='td_left'>
                <span style={{ fontWeight: 'bold' }}>{item.title} {item.rdate?.substring(0, 10)}</span><br />
                <span>
                  {item.content && item.content.length > 240
                    ? item.content.substring(0, 240) + '...'
                    : item.content}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='bottom_menu'>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className='btn btn-outline-secondary btn-sm'
        >
          새로 고침
        </button>
      </div>
    </div>
  )
}

export default Contents_List_all;

