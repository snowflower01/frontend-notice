import React, { useEffect, useState, useCallback, type KeyboardEvent } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { axiosInstance, getIP } from '../Tool';
import { GlobalStoreSession } from '../../store/store';
import none1_img from '../../assets/images/none1.png';
import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';

export default function Contents_List_all() {
  const navigate = useNavigate();
  const { cateno } = useParams<{ cateno: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 전역 세션 상태 추출 (login, id, memberno, grade)
  const { login, grade, id, memberno } = GlobalStoreSession();

useEffect(() => {
  // 💡 login이 true이거나 유효한 id가 있을 때만 로그인으로 인정
  const isAuth = login === true && id && id.trim() !== '';

  if (!isAuth) {
    alert('물류센터 사원 로그인이 필요한 서비스입니다.');
    navigate('/member/login');
    return;
  }
}, [login, id, memberno, navigate]);

  // 2. 뷰 모드 상태 (기본값: 'table', 옵션: 'table' | 'grid')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // 검색 및 페이징 파라미터 관리
  const initialPage = Number(searchParams.get('page') ?? 0);
  const initialWord = String(searchParams.get('word') ?? '');

  const [page, setPage] = useState<number>(initialPage);
  const [word, setWord] = useState<string>(initialWord);
  const [searchWord, setSearchWord] = useState<string>(initialWord);

  const [cate, setCate] = useState<CateType>({} as CateType);
  const [list, setList] = useState<ContentsType[]>([]);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 3. 카테고리 정보 로드
  useEffect(() => {
    if (!cateno) return;
    axiosInstance.get(`/cate/${cateno}`)
      .then(res => setCate(res.data))
      .catch(err => console.error('카테고리 정보 조회 실패:', err));
  }, [cateno]);

  // 4. 가이드 목록 페이징/검색 조회 (서버 최신 데이터 동기화)
  const fetchContents = useCallback(async () => {
    if (!cateno) return;
    try {
      setIsLoading(true);
      const res = await axiosInstance.get('/contents/list_all_paging_search', {
        params: {
          cateno: Number(cateno),
          word: word.trim(),
          page: page,
          size: viewMode === 'grid' ? 8 : 10,
        }
      });

      const pageData = res.data;
      setList(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (err) {
      console.error('가이드 목록 조회 실패:', err);
    } finally {
      setIsLoading(false);
    }
  }, [cateno, page, word, viewMode]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 검색 실행 핸들러
  const handleSearch = () => {
    setPage(0);
    setWord(searchWord);
    setSearchParams({ page: '0', word: searchWord });
  };

  // 페이지 이동 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setPage(newPage);
    setSearchParams({ page: String(newPage), word });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container" style={{ maxWidth: '1050px', margin: '40px auto', padding: '0 15px' }}>
      
      {/* 상단 타이틀 & 메뉴 헤더 */}
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom flex-wrap gap-2">
        <div>
          <span className="badge bg-secondary mb-1">{cate.grp || '공정'}</span>
          <h3 className="fw-bold mb-0 text-dark">
            📋 {cate.name || '공정'} 가이드 목록 ({totalElements})
          </h3>
        </div>

        <div className="d-flex gap-2">
          {login && grade <= 5 && (
            <Link to={`/contents/create/${cateno}`} className="btn btn-primary fw-bold btn-sm">
              + 새 가이드 등록
            </Link>
          )}
          <button 
            type="button" 
            onClick={fetchContents} 
            className="btn btn-light btn-sm border"
            title="새로고침"
          >
            🔄 최신 동기화
          </button>
        </div>
      </div>

      {/* 검색 바 및 뷰 모드 전환 토글 */}
      <div className="card shadow-sm border-0 mb-4 bg-light">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            
            {/* 검색 인풋 영역 */}
            <div className="d-flex flex-grow-1 align-items-center gap-2" style={{ minWidth: '280px', maxWidth: '650px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="검색어 입력 (공정명, 바코드, PDA, 지침 등)"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') handleSearch();
                }}
              />
              <button 
                type="button" 
                className="btn btn-dark fw-bold px-3 text-nowrap"
                onClick={handleSearch}
              >
                🔍 검색
              </button>
              {word && (
                <button
                  type="button"
                  className="btn btn-outline-secondary text-nowrap"
                  onClick={() => {
                    setSearchWord('');
                    setWord('');
                    setPage(0);
                    setSearchParams({ page: '0', word: '' });
                  }}
                >
                  초기화
                </button>
              )}
            </div>

            {/* 표 방식 / 카드 그리드 방식 전환 버튼 그룹 */}
            <div className="btn-group" role="group" aria-label="View Mode Toggle">
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-secondary fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('table')}
                title="테이블 표 형태로 보기"
              >
                📋 목록형
              </button>
              <button
                type="button"
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-secondary fw-bold' : 'btn-outline-secondary'}`}
                onClick={() => setViewMode('grid')}
                title="그리드 카드 형태로 보기"
              >
                🔲 카드형
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 콘텐츠 리스트 렌더링 */}
      {isLoading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          데이터를 불러오는 중입니다...
        </div>
      ) : list.length === 0 ? (
        <div className="card shadow-sm border-0 text-center py-5">
          <div className="card-body">
            <p className="text-muted fs-5 mb-3">등록된 작업 가이드가 없습니다.</p>
            {login && grade <= 5 && (
              <Link to={`/contents/create/${cateno}`} className="btn btn-primary btn-sm">
                첫 가이드 등록하기
              </Link>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        
        /* [표 방식] 텍스트 중심 테이블 뷰 */
        <div className="card shadow-sm border-0 mb-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary text-center small">
                <tr>
                  <th style={{ width: '130px' }}>미리보기</th>
                  <th>가이드 제목 및 상세 지침 요약</th>
                  <th style={{ width: '80px' }}>조회</th>
                  <th style={{ width: '80px' }}>추천</th>
                  <th style={{ width: '110px' }}>등록일</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => {
                  const thumbSrc = item.thumb1 && item.thumb1.trim() !== ''
                    ? `http://${getIP()}:9101/storage/contents/${item.thumb1.replace(/\s+/g, '')}?t=${Date.now()}`
                    : item.file1saved && item.file1saved.trim() !== ''
                      ? `http://${getIP()}:9101/storage/contents/${item.file1saved}?t=${Date.now()}`
                      : none1_img;

                  return (
                    <tr 
                      key={item.contentsno} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/contents/read/${item.contentsno}?page=${page}&word=${encodeURIComponent(word)}`)}
                    >
                      {/* 썸네일 */}
                      <td className="text-center p-2">
                        <div 
                          style={{ 
                            width: '110px', 
                            height: '75px', 
                            margin: '0 auto', 
                            borderRadius: '6px', 
                            overflow: 'hidden', 
                            backgroundColor: '#f8f9fa', 
                            border: '1px solid #dee2e6' 
                          }}
                        >
                          <img
                            src={thumbSrc}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (item.file1saved && !target.src.includes(item.file1saved)) {
                                target.src = `http://${getIP()}:9101/storage/contents/${item.file1saved}`;
                              } else {
                                target.src = none1_img;
                              }
                            }}
                          />
                        </div>
                      </td>

                      {/* 본문 지침 요약 */}
                      <td className="px-3 py-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="fw-bold text-dark fs-6">{item.title}</span>
                          {item.word && (
                            <span className="badge bg-light text-primary border" style={{ fontSize: '11px' }}>
                              #{item.word}
                            </span>
                          )}
                        </div>
                        <div 
                          className="text-secondary small" 
                          style={{ 
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-line',
                            maxHeight: '4.5em',
                            overflow: 'hidden'
                          }}
                        >
                          {item.content || '등록된 상세 작업 지침이 없습니다.'}
                        </div>
                      </td>

                      <td className="text-center text-muted small">
                        👁️ {item.cnt ?? 0}
                      </td>

                      <td className="text-center fw-bold text-primary small">
                        👍 {item.recom ?? 0}
                      </td>

                      <td className="text-center text-muted small">
                        {item.rdate ? item.rdate.substring(0, 10) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* [그리드 방식] 사진 중심 카드 뷰 */
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-4">
          {list.map((item) => {
            const thumbSrc = item.thumb1 && item.thumb1.trim() !== ''
              ? `http://${getIP()}:9101/storage/contents/${item.thumb1.replace(/\s+/g, '')}?t=${Date.now()}`
              : item.file1saved && item.file1saved.trim() !== ''
                ? `http://${getIP()}:9101/storage/contents/${item.file1saved}?t=${Date.now()}`
                : none1_img;

            return (
              <div key={item.contentsno} className="col">
                <div 
                  className="card h-100 shadow-sm border-0"
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'transform 0.15s ease-in-out',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  onClick={() => navigate(`/contents/read/${item.contentsno}?page=${page}&word=${encodeURIComponent(word)}`)}
                >
                  <div style={{ height: '170px', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
                    <img
                      src={thumbSrc}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (item.file1saved && !target.src.includes(item.file1saved)) {
                          target.src = `http://${getIP()}:9101/storage/contents/${item.file1saved}`;
                        } else {
                          target.src = none1_img;
                        }
                      }}
                    />
                  </div>

                  <div className="card-body p-3 d-flex flex-column">
                    <h6 className="card-title fw-bold text-dark text-truncate mb-2" title={item.title}>
                      {item.title}
                    </h6>
                    
                    <p 
                      className="card-text text-muted small mb-3 flex-grow-1" 
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4'
                      }}
                    >
                      {item.content || '지침 내용이 없습니다.'}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top text-muted small">
                      <div className="d-flex gap-2 align-items-center">
                        <span>👁️ {item.cnt ?? 0}</span>
                        <span className="text-primary fw-bold">👍 {item.recom ?? 0}</span>
                      </div>
                      <span className="text-secondary" style={{ fontSize: '11px' }}>
                        {item.rdate ? item.rdate.substring(0, 10) : ''}
                      </span>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* 페이징 네비게이션 */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${page === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                이전
              </button>
            </li>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <li key={idx} className={`page-item ${page === idx ? 'active' : ''}`}>
                <button className="page-link" onClick={() => handlePageChange(idx)}>
                  {idx + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${page === totalPages - 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                다음
              </button>
            </li>
          </ul>
        </div>
      )}

    </div>
  );
}