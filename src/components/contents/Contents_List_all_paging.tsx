import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance, getIP, isImage } from '../Tool';
import { GlobalStoreSession } from '../../store/store.ts'; 

import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';

import none1_img from '../../assets/images/none1.png';

// 페이지 번호 배열 생성
function range(start: number, end:number): number[] {
  const arr = [];
  for (let i = start; i <= end; i++) arr.push(i);
  return arr;
}

/**
 * 페이지바 생성 로직
 * - current: 현재 페이지 (1-base, 즉 화면에 표시되는 번호)
 * - totalPages: 전체 페이지 수
 * - window: 현재 페이지 기준 좌우 4개씩(총 9칸(페이지))을 보여줌
 */
function getPageNumbers(total_pages: number, current_page:number): number[] {
  // 전체 페이지가 0이면 페이지바 없음
  if (total_pages === 0) return [];

  const WIN = 4; // 현재 페이지 기준으로 좌우 4칸(페이지)씩 보여줄 폭

  // 시작번호: 최소 1페이지 이상
  let start = Math.max(1, current_page - WIN); // 9 - 4: 5, 현재 9페이지: 5 페이지 부터 출력    
  // Math.max(1, 1 - 4) -> 1

  // 끝번호: 전체 페이지 수를 넘지 않게 제한
  let end = Math.min(total_pages, current_page + WIN); // 현재 9페이지: 13 페이지 까지 출력    
  // Math.min(13, 13 + 4) -> 13

  /**
   * 페이지 개수를 최대 9개로 맞추기
   * (예: 1 2 3 4 [5] 6 7 8 9 형태)
   * 
   * end - start < 8  → 현재 표시된 구간이 9개 미만이면
   * start를 앞으로 당기거나(end를 뒤로 늘려서) 9개 유지 시도
   */
  while (end - start < 8) {
    if (start > 1) start--;               // 앞쪽으로 확장
    else if (end < total_pages) end++;     // 뒤쪽으로 확장
    else break;                           // 이미 양쪽 끝이면 종료
  }

  // start ~ end 범위의 숫자 배열 반환
  return range(start, end);
}

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
  const [page, setPage] = useState<number>(0); // 현재 페이지
  const [size] = useState<number>(2); // 페이지당 레코드수
  const [totalPages, setTotalPages] = useState<number>(0); // 전체 페이지수
  const [totalElements, setTotalElements] = useState<number>(0); // 전체 레코드 수

  const load = async (page:number) => {
    const res = await axiosInstance.get('/contents/list_all_paging', { params: {cateno, page, size} });
    setData(res.data.content);
    setPage(res.data.page);
    setTotalPages(res.data.totalPages);
    setTotalElements(res.data.totalElements);res
  }

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
      
      load(page); // 처음에는 0 페이지 로딩

  }, [cateno]);

  const current1 = page + 1; // 내부 page 처리는 0부터 시작이나 출력은 1부터 표시 되도록 함.
  const nums = getPageNumbers(totalPages, current1); // 페이지 배열

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
                           `http://${getIP()}:9100/contents/storage/${item.thumb1}`
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

      <div>
        {/* Prev */}
        <button
          disabled={page === 0}
          onClick={() => load(page - 1)}
          style={{marginRight: 8}}
          className='btn btn-light'
        >
          &lt;
        </button>

        {/* n: 페이지 번호 */}
        {nums.map(n => {
          const zeroBase = n - 1; // 배열값이 1부터 존재함으로 페이징 계산을 위해 0으로 변경
          const isCurr = n === current1; // 페이지 번호가 현재 페이지와 같으면 버튼 UI 강조
          return (
            <button
              key={n}
              onClick={() => load(zeroBase)}
              disabled={isCurr}
              style={{marginRight: 6}}
              className={`btn ${isCurr ? 'btn-secondary': 'btn-light'}`}
            >
              {n}
            </button>
          );
        })}

        {/* Next */}
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => load(page + 1)}
          style={{marginLeft: 8}}
          className='btn btn-light'
        >
          &gt;
        </button>

        {/* 부가 정보 */}
        <div style={{marginTop: 8, color: '#666'}}>
          page: {current1}/{totalPages} • total: {totalElements}
        </div>
      </div>

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

