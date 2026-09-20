import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { GlobalStoreSession } from '../../store/store';
import SimpleModal, { type SimpleModalTypePayload } from '../SimpleModal';
import type CateType from '../cate/CateType';

export default function Contents_Create() {
  const navigate = useNavigate();
  const { cateno } = useParams<{ cateno: string }>();

  // Zustand 세션 스토어에서 로그인 정보 추출
  const { memberno, login } = GlobalStoreSession();

  // 모달 상태
  const [modal, setModal] = useState<SimpleModalTypePayload>({
    show: false,
    title: '',
    message: '',
    onConfirm: undefined,
  });

  const openModal = (payload: SimpleModalTypePayload) => setModal({
    show: true,
    title: payload.title,
    message: payload.message,
    onConfirm: payload.onConfirm ?? undefined,
  });

  const closeModal = () => setModal(prev => ({ ...prev, show: false }));

  // 카테고리 정보 및 입력 폼 상태
  const [cate, setCate] = useState<CateType>({} as CateType);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [passwd, setPasswd] = useState<string>('1234');
  const [word, setWord] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 카테고리 정보 로드
  useEffect(() => {
    if (!cateno) return;

    axiosInstance.get(`/cate/${cateno}`)
      .then(res => setCate(res.data))
      .catch(err => console.error('카테고리 정보 조회 실패:', err));
  }, [cateno]);

  // 이미지 파일 선택 핸들러 + 미리보기
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    setFile(selectedFile);

    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl('');
    }
  };

  // 등록 제출 핸들러 (POST /contents/create)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      openModal({ show: true, title: '입력 확인', message: '가이드 제목을 입력해 주세요.' });
      return;
    }
    if (!passwd.trim()) {
      openModal({ show: true, title: '입력 확인', message: '수정/삭제용 비밀번호를 입력해 주세요.' });
      return;
    }

    const formData = new FormData();
    formData.append('cateno', String(cateno));
    formData.append('memberno', String(memberno || 1));
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('passwd', passwd.trim());
    formData.append('password', passwd.trim()); // 백엔드 DTO 및 파라미터 호환성 보장
    formData.append('word', word.trim());

    if (file) {
      formData.append('file1MF', file);
    }

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post('/contents/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.contentsno) {
        openModal({
          show: true,
          title: '등록 완료',
          message: '새 가이드 콘텐츠가 성공적으로 등록되었습니다.',
          onConfirm: () => navigate(`/contents/list_all/${cateno}`),
        });
      } else {
        openModal({
          show: true,
          title: '등록 실패',
          message: '서버 등록 처리 중 문제가 발생했습니다.',
        });
      }
    } catch (err) {
      console.error('콘텐츠 등록 에러:', err);
      openModal({
        show: true,
        title: '네트워크 오류',
        message: '서버와 통신 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 15px' }}>
      
      {/* 상단 경로 안내 */}
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-secondary mb-1">{cate.grp || '공정'}</span>
          <h3 className="fw-bold mb-0 text-dark">📝 {cate.name || '가이드'} 신규 등록</h3>
        </div>
        <Link to={`/contents/list_all/${cateno}`} className="btn btn-outline-secondary btn-sm">
          ← 목록으로
        </Link>
      </div>

      {/* 등록 카드 폼 */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* 1. 가이드 제목 */}
            <div className="mb-3">
              <label className="form-label fw-bold">가이드 제목 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="예: [IB] 입고 토트 바코드 스캔 표준 절차"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* 2. 첨부 이미지 및 미리보기 */}
            <div className="row g-3 mb-3">
              <div className="col-md-7">
                <label className="form-label fw-bold">현장 사진 / 지침 이미지 첨부</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="form-text small">
                  JPG, PNG 등 현장 작업 가이드 사진을 등록해 주세요.
                </div>
              </div>
              <div className="col-md-5 text-center">
                <label className="form-label fw-bold text-muted small d-block">사진 미리보기</label>
                <div 
                  style={{ 
                    height: '140px', 
                    borderRadius: '8px', 
                    border: '2px dashed #dee2e6', 
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="미리보기" 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  ) : (
                    <span className="text-muted small">선택된 사진 없음</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. 작업 지침 상세 내용 */}
            <div className="mb-3">
              <label className="form-label fw-bold">상세 작업 지침 (본문)</label>
              <textarea
                className="form-control"
                rows={8}
                placeholder="작업 순서, 주의사항, PDA 조작 요령 등을 상세히 입력해 주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* 4. 태그 및 비밀번호 */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">검색 태그 (단어)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="예: 바코드, 입고, PDA, 안전"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">비밀번호 <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="수정/삭제 시 사용할 비밀번호"
                  value={passwd}
                  onChange={(e) => setPasswd(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 5. 제출 버튼 */}
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Link to={`/contents/list_all/${cateno}`} className="btn btn-outline-secondary px-4">
                취소
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary px-4 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? '등록 중...' : '가이드 등록 완료'}
              </button>
            </div>

          </form>
        </div>
      </div>

      <SimpleModal
        show={modal.show ?? false}
        title={modal.title}
        message={modal.message}
        onClose={modal.onConfirm || closeModal}
        onConfirm={modal.onConfirm || closeModal}
      />
    </div>
  );
}