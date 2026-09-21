import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { axiosInstance, getIP } from './Tool';
import { GlobalStoreSession } from '../store/store';
import none1_img from '../assets/images/none1.png';
import type ContentsType from './contents/ContentsType';
import type CateType from './cate/CateType';

interface NoticeType {
  noticeno: number;
  title: string;
  rdate: string;
}

export default function Home() {
  const navigate = useNavigate();

  // 타입 에러 방지를 위해 as any로 감싸서 session 속성 안전하게 접근
  const session = GlobalStoreSession() as any;
  const storeId = session?.id;
  const storeLogin = session?.login;

  // 실제 연동 데이터 상태 관리
  const [cateList, setCateList] = useState<CateType[]>([]);
  const [bestList, setBestList] = useState<ContentsType[]>([]);
  const [noticeList, setNoticeList] = useState<NoticeType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 💡 비로그인 사원 차단 가드 함수 (memberno: 99 버그 원천 차단)
  const checkAuthAndNavigate = (targetUrl: string) => {
    const sessionId = sessionStorage.getItem('id');

    // 1. 스토어의 id가 실제로 채워져 있거나
    // 2. storeLogin이 명시적으로 true이거나
    // 3. 브라우저 sessionStorage에 id가 존재할 때만 로그인으로 판정
    const isAuthenticated = Boolean(
      (storeId && String(storeId).trim() !== '') ||
      (storeLogin === true) ||
      (sessionId && sessionId.trim() !== '')
    );

    if (!isAuthenticated) {
      alert('물류센터 사원 로그인이 필요한 서비스입니다.');
      navigate('/member/login');
      return;
    }

    navigate(targetUrl);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // 1. 공정 카테고리 목록
        const cateRes = await axiosInstance.get('/cate/list_all_visible').catch((err) => {
          console.error('❌ /cate/list_all_visible 호출 실패:', err);
          return { data: [] };
        });
        
        const rawCates: CateType[] = Array.isArray(cateRes.data) ? cateRes.data : [];
        const filteredCates = rawCates.filter((c) => c.name && c.name.trim() !== '--');
        setCateList(filteredCates);

        // 2. Best 추천 가이드 (상위 3건)
        const bestRes = await axiosInstance.get('/contents/best_recom').catch((err) => {
          console.error('❌ /contents/best_recom 호출 실패:', err);
          return { data: [] };
        });
        setBestList(Array.isArray(bestRes.data) ? bestRes.data : []);

        // 3. 최신 공지사항 (상위 6건)
        const noticeRes = await axiosInstance.get('/notice/list_by_page', {
          params: { page: 0, size: 6 }
        }).catch((err) => {
          console.error('❌ /notice/list_by_page 호출 실패:', err);
          return { data: { content: [] } };
        });

        const notices = noticeRes.data?.content || noticeRes.data || [];
        setNoticeList(Array.isArray(notices) ? notices.slice(0, 6) : []);
      } catch (err) {
        console.error('대시보드 데이터 로드 오류:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div style={{ width: '100%', margin: '0 auto', padding: '0 10px' }}>
      
      {/* 메인 통합 카드 */}
      <div 
        className="card shadow-sm border-0" 
        style={{ 
          borderRadius: '12px', 
          backgroundColor: '#ffffff',
          border: '1px solid #e9ecef'
        }}
      >
        <div className="card-body p-4 p-md-5">

          {/* 1. 타이틀 영역 */}
          <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom flex-wrap gap-2">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: '#0074e4', letterSpacing: '-0.5px' }}>
                coupang <span style={{ color: '#212529', fontSize: '20px', fontWeight: '600' }}>풀필먼트 서비스</span>
              </h4>
              <p className="text-muted small mb-0">
                공정 사원 표준 작업 지침 및 물류 관리 시스템
              </p>
            </div>
            <div className="d-flex gap-2">
              <span className="badge bg-light text-primary border px-3 py-2" style={{ fontSize: '12px' }}>
                실시간 포털
              </span>
            </div>
          </div>

          {/* 2. 상단 2열: 센터 대표 이미지 (좌) + 최신 공지사항 (우) */}
          <div className="row g-4 mb-4 align-items-stretch">
            
            {/* 좌측: 센터 대표 이미지 */}
            <div className="col-lg-7">
              <div 
                className="position-relative h-100 shadow-sm" 
                style={{ 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  minHeight: '320px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6'
                }}
              >
                <img 
                  src="./images/cp.jpg" 
                  alt="Coupang Fulfillment Center"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                  onError={(e) => { (e.target as HTMLImageElement).src = none1_img; }}
                />
              </div>
            </div>

            {/* 우측: 실제 공지사항 목록 */}
            <div className="col-lg-5">
              <div 
                className="p-3 border rounded-3 bg-white h-100 d-flex flex-column shadow-sm"
                style={{ borderColor: '#e9ecef' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="fw-bold text-dark" style={{ fontSize: '15px' }}>
                    📢 센터 공지사항
                  </span>
                  <Link to="/notice/list" className="text-decoration-none text-muted" style={{ fontSize: '12px' }}>
                    전체보기 &gt;
                  </Link>
                </div>

                <div className="flex-grow-1">
                  {noticeList.length === 0 ? (
                    <div className="text-center text-muted py-5 small">
                      등록된 공지사항이 없습니다.
                    </div>
                  ) : (
                    <ul className="list-unstyled mb-0">
                      {noticeList.map((n) => (
                        <li 
                          key={n.noticeno} 
                          onClick={() => navigate(`/notice/detail/${n.noticeno}`)}
                          className="py-2 border-bottom d-flex justify-content-between align-items-center text-truncate"
                          style={{ cursor: 'pointer', fontSize: '13.5px' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0074e4')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                        >
                          <span className="text-truncate me-2">
                            📌 {n.title}
                          </span>
                          <span className="text-muted text-nowrap" style={{ fontSize: '11.5px' }}>
                            {n.rdate ? n.rdate.substring(0, 10) : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* 3. 공정별 바로가기 (5열 최적화 + 사원 인증 가드) */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0">📂 공정별 표준 작업 지침 바로가기</h6>
              <span className="text-muted small">현장 배정 공정을 선택하세요</span>
            </div>

            <div className="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-3">
              {cateList.length === 0 ? (
                <div className="col-12 text-center text-muted py-4 border rounded bg-light small">
                  등록된 공정 카테고리가 없습니다.
                </div>
              ) : (
                cateList.map((c) => (
                  <div key={c.cateno} className="col">
                    <div
                      onClick={() => checkAuthAndNavigate(`/contents/list_all/${c.cateno}`)}
                      className="card h-100 border p-3 text-center shadow-sm"
                      style={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e9ecef',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease-in-out'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f7ff';
                        e.currentTarget.style.borderColor = '#0074e4';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* 대분류 배지 */}
                      <div className="mb-2">
                        <span 
                          className="badge" 
                          style={{ 
                            backgroundColor: '#e7f1ff', 
                            color: '#0074e4', 
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          {c.grp || '표준 공정'}
                        </span>
                      </div>

                      {/* 공정 아이콘 분기 */}
                      <div className="fs-3 mb-1">
                        {c.name?.includes('출근') ? '📋' :
                         c.name?.includes('PDA') || c.name?.includes('진열') ? '📱' :
                         c.name?.includes('집적') || c.name?.includes('Picking') ? '🛒' :
                         c.name?.includes('포장') || c.name?.includes('Packing') ? '📦' :
                         c.name?.includes('상차') || c.name?.includes('HUB') ? '🚚' : '🏭'}
                      </div>

                      {/* 소분류 명칭 */}
                      <div className="fw-bold text-dark text-truncate" style={{ fontSize: '13.5px' }} title={c.name}>
                        {c.name ?? '공정'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 4. 사원 추천 Best 가이드 (TOP 3 + 사원 인증 가드) */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0">🔥 추천수 높은 Best 가이드 (TOP 3)</h6>
              <span className="text-muted small">현장 작업자 추천 순위</span>
            </div>

            <div className="row row-cols-1 row-cols-md-3 g-3">
              {bestList.length === 0 ? (
                <div className="col-12 text-center text-muted py-4 border rounded bg-light small">
                  등록된 추천 가이드가 없습니다.
                </div>
              ) : (
                bestList.map((item, idx) => {
                  const thumbSrc = item.thumb1 && item.thumb1.trim() !== ''
                    ? `http://${getIP()}:9101/storage/contents/${item.thumb1.replace(/\s+/g, '')}?t=${Date.now()}`
                    : item.file1saved && item.file1saved.trim() !== ''
                      ? `http://${getIP()}:9101/storage/contents/${item.file1saved}?t=${Date.now()}`
                      : none1_img;

                  return (
                    <div key={item.contentsno} className="col">
                      <div
                        onClick={() => checkAuthAndNavigate(`/contents/read/${item.contentsno}`)}
                        className="card h-100 border shadow-sm p-3 position-relative"
                        style={{
                          borderRadius: '8px',
                          cursor: 'pointer',
                          borderColor: '#dee2e6',
                          backgroundColor: '#ffffff',
                          transition: 'all 0.15s ease-in-out'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#0074e4';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#dee2e6';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span 
                          className="position-absolute top-0 start-0 badge m-2"
                          style={{ 
                            backgroundColor: idx === 0 ? '#0074e4' : '#6c757d', 
                            fontSize: '11px' 
                          }}
                        >
                          #{idx + 1} Best
                        </span>

                        <div style={{ height: '140px', overflow: 'hidden', borderRadius: '6px', backgroundColor: '#f8f9fa' }}>
                          <img
                            src={thumbSrc}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = none1_img; }}
                          />
                        </div>

                        <div className="pt-3 d-flex flex-column flex-grow-1">
                          <h6 className="fw-bold text-dark text-truncate mb-1" title={item.title}>
                            {item.title}
                          </h6>
                          <p 
                            className="text-muted small mb-3 flex-grow-1"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: '1.4'
                            }}
                          >
                            {item.content || '세부 지침 확인'}
                          </p>

                          <div className="d-flex justify-content-between align-items-center pt-2 border-top text-muted small">
                            <span>👁️ {item.cnt ?? 0}</span>
                            <span className="fw-bold" style={{ color: '#0074e4' }}>👍 {item.recom ?? 0}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}