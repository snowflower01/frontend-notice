import React, { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import SimpleModal, { type SimpleModalTypePayload } from '../SimpleModal';
import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';

export default function Contents_Update_text() {
  const navigate = useNavigate();
  const { contentsno } = useParams<{ contentsno: string }>();

  // 1. 모달 상태
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

  // 2. 폼 및 데이터 상태
  const [cate, setCate] = useState<CateType>({} as CateType);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [word, setWord] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [cateno, setCateno] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
      // 1. contentsno가 없거나 NaN일 경우 조기 종료
      if (!contentsno || contentsno === 'undefined') return;

      axiosInstance.get(`/contents/read/${contentsno}`)
        .then(res => {
          const data: ContentsType = res.data;
          if (!data) return;

          setTitle(data.title ?? '');
          setContent(data.content ?? '');
          setWord(data.word ?? '');
          
          // cateno 기본값 0 보장 (타입 에러 방지)
          const currentCateno = Number(data.cateno ?? 0);
          setCateno(currentCateno);

          // cateno가 유효한 번호일 때만 카테고리 정보 조회
          if (currentCateno > 0) {
            axiosInstance.get(`/cate/${currentCateno}`)
              .then(cateRes => {
                if (cateRes.data) setCate(cateRes.data);
              })
              .catch(err => console.error('카테고리 로드 실패:', err));
          }
        })
        .catch(err => console.error('콘텐츠 로드 실패:', err));
    }, [contentsno]);

  // 3. 본문 텍스트 수정 제출 (POST /contents/update_text)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      openModal({ show: true, title: '확인', message: '가이드 제목을 입력해 주세요.' });
      return;
    }
    if (!password.trim()) {
      openModal({ show: true, title: '확인', message: '등록 시 설정한 비밀번호를 입력해 주세요.' });
      return;
    }

    // 백엔드 ContentsCont.update_text 파라미터 규격에 맞춘 폼데이터 조립
    const formData = new FormData();
    formData.append('contentsno', String(contentsno));
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('word', word.trim());
    formData.append('password', password.trim());
    formData.append('passwd', password.trim());

    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post('/contents/update_text', formData);
      const result = Number(res.data);

      if (result === 1) {
        openModal({
          show: true,
          title: '수정 완료',
          message: '본문 내용이 성공적으로 수정되었습니다.',
          onConfirm: () => navigate(`/contents/read/${contentsno}`),
        });
      } else if (result === 2) {
        openModal({
          show: true,
          title: '비밀번호 불일치',
          message: '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.',
        });
      } else {
        openModal({
          show: true,
          title: '수정 실패',
          message: '본문 수정 처리에 실패했습니다.',
        });
      }
    } catch (err) {
      console.error('본문 수정 에러:', err);
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
      
      {/* 상단 헤더 */}
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-secondary mb-1">{cate.grp || '공정'}</span>
          <h3 className="fw-bold mb-0 text-dark">✏️ {cate.name || '가이드'} 본문 수정</h3>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/contents/read/${contentsno}`} className="btn btn-outline-secondary btn-sm">
            상세보기로
          </Link>
          <Link to={`/contents/list_all/${cateno}`} className="btn btn-outline-secondary btn-sm">
            목록으로
          </Link>
        </div>
      </div>

      {/* 폼 카드 */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            
            {/* 가이드 제목 */}
            <div className="mb-3">
              <label className="form-label fw-bold">가이드 제목 <span className="text-danger">*</span></label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* 작업 지침 내용 */}
            <div className="mb-3">
              <label className="form-label fw-bold">상세 작업 지침 (본문)</label>
              <textarea
                className="form-control"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ lineHeight: '1.6' }}
              />
            </div>

            {/* 태그 및 비밀번호 */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">검색 태그</label>
                <input
                  type="text"
                  className="form-control"
                  value={word}
                  placeholder="예: 바코드, 진열, RTO"
                  onChange={(e) => setWord(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">비밀번호 확인 <span className="text-danger">*</span></label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="등록 시 입력한 비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Link to={`/contents/read/${contentsno}`} className="btn btn-outline-secondary px-4">
                취소
              </Link>
              <button 
                type="submit" 
                className="btn btn-primary px-4 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? '저장 중...' : '수정 사항 저장'}
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