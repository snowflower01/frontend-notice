import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  axiosInstance, 
  getIP, 
  getYoutubeId, 
  download, 
  splitKakaoMapString 
} from '../Tool';
import { GlobalStoreSession } from '../../store/store';
import none1_img from '../../assets/images/none1.png';
import ReplyList from '../reply/ReplyList';

import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';

export default function Contents_Read() {
  const navigate = useNavigate();
  const { contentsno } = useParams<{ contentsno: string }>();
  const [searchParams] = useSearchParams();

  const { login, grade } = GlobalStoreSession();

  const page = Number(searchParams.get('page') ?? 0);
  const word = String(searchParams.get('word') ?? '');

  const [cate, setCate] = useState<CateType>({} as CateType);
  const [data, setData] = useState<ContentsType>({} as ContentsType);
  const [imgSrc, setImgSrc] = useState<string>(none1_img);
  const [mapArray, setMapArray] = useState<string[]>([]);

  // 카운트 관련 상태
  const [cnt, setCnt] = useState<number>(0);
  const [recom, setRecom] = useState<number>(0);
  const [isRecomLoading, setIsRecomLoading] = useState<boolean>(false);

  // 이전글 / 다음글 상태
  const [prevPost, setPrevPost] = useState<{ contentsno: number; title: string }>({ contentsno: 0, title: '' });
  const [nextPost, setNextPost] = useState<{ contentsno: number; title: string }>({ contentsno: 0, title: '' });

  // 이미지 확대 모달 상태
  const [showImageModal, setShowImageModal] = useState<boolean>(false);

  // 삭제 모달 상태
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!contentsno || contentsno === 'undefined') return;

    // 1. 상세 로드
    axiosInstance.get(`/contents/read/${contentsno}`)
      .then(res => {
        const item: ContentsType = res.data;
        if (!item) return;

        setData(item);
        setCnt(Number(item.cnt ?? 0));
        setRecom(Number(item.recom ?? 0));

        if (item.map) {
          setMapArray(splitKakaoMapString(item.map));
        }

        // 이미지 경로 처리
        if (item.file1saved && item.file1saved.trim() !== '') {
          setImgSrc(`http://${getIP()}:9101/storage/contents/${item.file1saved}?t=${Date.now()}`);
        } else {
          setImgSrc(none1_img);
        }

        const currentCateno = Number(item.cateno ?? 0);
        if (currentCateno > 0) {
          // 카테고리 정보 로드
          axiosInstance.get(`/cate/${currentCateno}`)
            .then(cateRes => {
              if (cateRes.data) setCate(cateRes.data);
            })
            .catch(err => console.error('카테고리 로드 실패:', err));

          // 💡 이전글 / 다음글 조회 요청
          axiosInstance.get('/contents/prev_next', {
            params: { cateno: currentCateno, contentsno: Number(contentsno) }
          })
            .then(pnRes => {
              if (pnRes.data) {
                setPrevPost({
                  contentsno: Number(pnRes.data.prev_contentsno ?? 0),
                  title: String(pnRes.data.prev_title ?? '')
                });
                setNextPost({
                  contentsno: Number(pnRes.data.next_contentsno ?? 0),
                  title: String(pnRes.data.next_title ?? '')
                });
              }
            })
            .catch(err => console.error('이전/다음글 조회 실패:', err));
        }
      })
      .catch(err => {
        console.error('콘텐츠 로드 실패:', err);
        alert('존재하지 않거나 삭제된 게시글입니다.');
        navigate(-1);
      });
  }, [contentsno, navigate]);

  // 카카오 지도 스크립트 로드
  useEffect(() => {
    if (mapArray.length !== 3) return;
    const [containerId, timestamp, key] = mapArray;

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
      const mapTag = document.getElementById(containerId);
      if (!mapTag) return;
      mapTag.innerHTML = '';

      new (window as any).daum.roughmap.Lander({
        timestamp,
        key,
        mapWidth: "100%",
        mapHeight: "360",
      }).render();
    };

    renderMap();
  }, [mapArray]);

  // 추천수 증가 핸들러
  const handleRecom = async () => {
    if (isRecomLoading || !contentsno) return;

    const storageKey = `cfs_recom_${contentsno}`;
    if (localStorage.getItem(storageKey)) {
      alert('이미 추천하신 공정 지침입니다.');
      return;
    }

    try {
      setIsRecomLoading(true);
      const res = await axiosInstance.post(`/contents/update_recom/${contentsno}`);

      if (res.data && res.data.recom !== undefined) {
        setRecom(res.data.recom);
        localStorage.setItem(storageKey, 'true');
        alert('유용한 공정 지침으로 추천되었습니다.');
      } else {
        setRecom(prev => prev + 1);
        localStorage.setItem(storageKey, 'true');
      }
    } catch (err) {
      console.error('추천 실패:', err);
      alert('추천 반영 중 서버 오류가 발생했습니다.');
    } finally {
      setIsRecomLoading(false);
    }
  };

  // 삭제 요청 핸들러
  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      alert('비밀번호를 입력해 주세요.');
      return;
    }

    if (!window.confirm('정말 이 가이드 콘텐츠를 삭제하시겠습니까?')) return;

    try {
      setIsDeleting(true);
      const res = await axiosInstance.delete('/contents/delete', {
        params: {
          contentsno: Number(contentsno),
          password: password.trim(),
          passwd: password.trim()
        }
      });

      const result = Number(res.data);

      if (result === 1) {
        alert('콘텐츠가 삭제되었습니다.');
        setShowDeleteModal(false);
        navigate(`/contents/list_all/${data.cateno || cate.cateno}`);
      } else if (result === 2) {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        alert('삭제 처리에 실패하였습니다.');
      }
    } catch (err) {
      console.error('삭제 에러:', err);
      alert('서버 통신 중 에러가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasImage = Boolean(data.file1saved && data.file1saved.trim() !== '');

  return (
    <div className="container" style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 15px' }}>
      
      {/* 1. 상단 네비게이션 & 관리자 액션 바 */}
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom flex-wrap gap-2">
        <div>
          <span className="badge bg-secondary mb-1 me-2">{cate.grp || '공정'}</span>
          <span className="text-muted small fw-bold">&gt; {cate.name || '가이드'}</span>
          <h3 className="fw-bold mb-0 text-dark mt-1">{data.title || '가이드 상세보기'}</h3>
        </div>
        
        <div className="d-flex gap-2 align-items-center">
          <Link 
            to={`/contents/list_all/${data.cateno || cate.cateno}?page=${page}&word=${encodeURIComponent(word)}`} 
            className="btn btn-outline-secondary btn-sm"
          >
            ← 목록으로
          </Link>

          {login && grade <= 5 && (
            <>
              <Link to={`/contents/update_text/${data.contentsno}`} className="btn btn-outline-primary btn-sm">
                ✏️ 본문 수정
              </Link>
              <Link to={`/contents/update_file1/${data.contentsno}`} className="btn btn-outline-info btn-sm">
                🖼️ 사진 교체
              </Link>
              <button 
                type="button" 
                onClick={() => { setPassword(''); setShowDeleteModal(true); }} 
                className="btn btn-outline-danger btn-sm"
              >
                🗑️ 삭제
              </button>
            </>
          )}

          <button 
            type="button" 
            onClick={() => window.location.reload()} 
            className="btn btn-light btn-sm border"
            title="새로고침"
          >
            🔄
          </button>
        </div>
      </div>

      {/* 2. 본문 메인 카드 */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-4">
          
          {/* 메타 정보 */}
          <div className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2 text-muted small">
            <div className="d-flex gap-3">
              <span>📅 등록일: {data.rdate ? data.rdate.substring(0, 16).replace('T', ' ') : '-'}</span>
              <span>👁️ 조회수: {cnt}</span>
              <span>👍 추천수: {recom}</span>
            </div>
            {data.word && (
              <div>
                태그: <span className="badge bg-light text-primary border">#{data.word}</span>
              </div>
            )}
          </div>

          {/* 메인 가이드 사진 전시 영역 */}
          {hasImage && (
            <div className="text-center mb-4">
              <div 
                className="position-relative d-inline-block shadow-sm"
                style={{ 
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6', 
                  maxWidth: '100%', 
                  cursor: 'zoom-in' 
                }}
                onClick={() => setShowImageModal(true)}
                title="클릭 시 원본 크기로 확대"
              >
                <img 
                  src={imgSrc} 
                  alt={data.title} 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '520px', 
                    objectFit: 'contain', 
                    display: 'block' 
                  }} 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src.includes('/storage/contents/')) {
                      target.src = target.src.replace('/storage/contents/', '/contents/storage/');
                    } else {
                      target.src = none1_img;
                    }
                  }}
                />
                <div 
                  className="position-absolute bottom-0 end-0 bg-dark text-white px-3 py-1 small"
                  style={{ opacity: 0.8, borderTopLeftRadius: '8px' }}
                >
                  🔍 클릭하여 확대
                </div>
              </div>

              {/* 다운로드 및 파일 정보 */}
              <div className="mt-2 d-flex justify-content-center align-items-center gap-3 text-muted small">
                <span>📁 {data.file1}</span>
                <span>({data.size1_label || `${Math.round((data.size1 || 0) / 1024)} KB`})</span>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm py-0 px-2"
                  style={{ fontSize: '12px' }}
                  onClick={(e) => {
                    e.preventDefault();
                    download('contents', `${data.file1saved}`, `${data.file1}`);
                  }}
                >
                  📥 파일 원본 저장
                </button>
              </div>
            </div>
          )}

          {/* 작업 지침 본문 텍스트 */}
          <div 
            className="p-4 bg-light rounded" 
            style={{ 
              minHeight: '180px', 
              whiteSpace: 'pre-wrap', 
              lineHeight: '1.8', 
              fontSize: '16px', 
              color: '#212529', 
              border: '1px solid #e9ecef' 
            }}
          >
            {data.content || '등록된 상세 작업 지침이 없습니다.'}
          </div>

          {/* 추천 버튼 영역 */}
          <div className="text-center py-4 border-top mt-4">
            <button
              type="button"
              onClick={handleRecom}
              disabled={isRecomLoading}
              className="btn btn-outline-primary px-4 py-2 rounded-pill fw-bold shadow-sm"
            >
              👍 유용한 가이드 추천 <span className="badge bg-primary text-white ms-1">{recom}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. 부가 미디어: YouTube 영상 */}
      {data.youtube && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white fw-bold py-3">
            📺 실무 동영상 교육
          </div>
          <div className="card-body p-0">
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(data.youtube)}`}
                title="YouTube player"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. 부가 미디어: 카카오 지도 */}
      {mapArray.length === 3 && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-header bg-white fw-bold py-3">
            📍 작업 구역 및 안전 구역 안내도
          </div>
          <div className="card-body p-3">
            <div id={mapArray[0]} className="root_daum_roughmap root_daum_roughmap_landing" style={{ width: '100%' }} />
          </div>
        </div>
      )}

      {/* 💡 5. 이전글 / 다음글 연속 이동 네비게이션 카드 */}
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '10px' }}>
        <ul className="list-group list-group-flush" style={{ borderRadius: '10px' }}>
          {/* 이전글 */}
          <li className="list-group-item d-flex align-items-center py-3">
            <span 
              className="badge bg-light text-secondary border me-3 d-flex align-items-center justify-content-center" 
              style={{ width: '70px', height: '26px', fontSize: '11.5px' }}
            >
              ▲ 이전글
            </span>
            {prevPost.contentsno > 0 ? (
              <span 
                onClick={() => navigate(`/contents/read/${prevPost.contentsno}`)}
                className="text-dark text-truncate"
                style={{ cursor: 'pointer', fontSize: '14.5px', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0074e4')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#212529')}
              >
                {prevPost.title}
              </span>
            ) : (
              <span className="text-muted small">이전 가이드 글이 없습니다.</span>
            )}
          </li>

          {/* 다음글 */}
          <li className="list-group-item d-flex align-items-center py-3">
            <span 
              className="badge bg-light text-secondary border me-3 d-flex align-items-center justify-content-center" 
              style={{ width: '70px', height: '26px', fontSize: '11.5px' }}
            >
              ▼ 다음글
            </span>
            {nextPost.contentsno > 0 ? (
              <span 
                onClick={() => navigate(`/contents/read/${nextPost.contentsno}`)}
                className="text-dark text-truncate"
                style={{ cursor: 'pointer', fontSize: '14.5px', transition: 'color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0074e4')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#212529')}
              >
                {nextPost.title}
              </span>
            ) : (
              <span className="text-muted small">다음 가이드 글이 없습니다.</span>
            )}
          </li>
        </ul>
      </div>

      {/* 6. 현장 피드백 & 댓글 컴포넌트 마운트 */}
      <ReplyList contentsno={Number(contentsno)} />

      {/* 7. 사진 원본 확대 모달 (라이트박스) */}
      {showImageModal && hasImage && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setShowImageModal(false)}
        >
          <div className="modal-dialog modal-xl modal-dialog-centered" style={{ maxWidth: '90vw' }}>
            <div className="modal-content border-0 bg-transparent text-center">
              <div className="d-flex justify-content-end mb-2">
                <button 
                  type="button" 
                  className="btn btn-close btn-close-white" 
                  onClick={() => setShowImageModal(false)}
                />
              </div>
              <img 
                src={imgSrc} 
                alt="원본 사진" 
                style={{ maxHeight: '85vh', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', borderRadius: '8px' }} 
              />
              <div className="text-white mt-2 small">
                {data.title} — 원본 이미지 ({data.file1})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. 콘텐츠 삭제 확인 모달 */}
      {showDeleteModal && (
        <div 
          className="modal fade show d-block" 
          tabIndex={-1} 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">⚠️ 콘텐츠 삭제</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowDeleteModal(false)}
                />
              </div>
              <form onSubmit={handleDeleteSubmit}>
                <div className="modal-body py-4">
                  <p className="text-secondary mb-3">
                    삭제 시 본문과 첨부된 현장 사진이 완전히 제거됩니다.<br />
                    등록 시 설정한 <strong>비밀번호</strong>를 입력해 주세요.
                  </p>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="modal-footer bg-light">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger fw-bold"
                    disabled={isDeleting}
                  >
                    {isDeleting ? '삭제 중...' : '확인 및 영구 삭제'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}