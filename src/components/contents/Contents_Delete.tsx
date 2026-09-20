import React, { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import SimpleModal, { type SimpleModalTypePayload } from '../SimpleModal';
import type ContentsType from './ContentsType';

export default function Contents_Delete() {
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

  // 2. 상태 관리
  const [data, setData] = useState<ContentsType>({} as ContentsType);
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!contentsno || contentsno === 'undefined') return;

    axiosInstance.get(`/contents/read/${contentsno}`)
      .then(res => {
        if (res.data) setData(res.data);
      })
      .catch(err => {
        console.error('콘텐츠 조회 실패:', err);
        alert('존재하지 않거나 이미 삭제된 게시글입니다.');
        navigate(-1);
      });
  }, [contentsno, navigate]);

  // 3. 삭제 요청 처리 (DELETE /contents/delete)
  const handleDelete = async (e: FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      openModal({
        show: true,
        title: '확인',
        message: '등록 시 설정한 비밀번호를 입력해 주세요.',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      // Spring 컨트롤러 규격에 맞게 쿼리스트링 전달
      const res = await axiosInstance.delete('/contents/delete', {
        params: {
          contentsno: Number(contentsno),
          password: password.trim(),
          passwd: password.trim(), // 백엔드 파라미터명 호환
        }
      });

      const result = Number(res.data);

      if (result === 1) {
        openModal({
          show: true,
          title: '삭제 완료',
          message: '가이드 콘텐츠 및 첨부 이미지가 완전히 삭제되었습니다.',
          onConfirm: () => navigate(`/contents/list_all/${data.cateno}`),
        });
      } else if (result === 2) {
        openModal({
          show: true,
          title: '비밀번호 불일치',
          message: '비밀번호가 일치하지 않습니다. 다시 입력해 주세요.',
        });
      } else {
        openModal({
          show: true,
          title: '삭제 실패',
          message: '삭제 처리에 실패했습니다. (결과 코드: ' + result + ')',
        });
      }
    } catch (err) {
      console.error('삭제 요청 에러:', err);
      openModal({
        show: true,
        title: '네트워크 오류',
        message: '서버와 통신 중 문제가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '60px auto', padding: '0 15px' }}>
      
      {/* 상단 네비게이션 */}
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <h3 className="fw-bold mb-0 text-danger">⚠️ 가이드 삭제</h3>
        <Link to={`/contents/read/${contentsno}`} className="btn btn-outline-secondary btn-sm">
          취소하고 돌아가기
        </Link>
      </div>

      {/* 삭제 확인 카드 */}
      <div className="card border-danger shadow-sm">
        <div className="card-header bg-danger text-white py-3 fw-bold">
          정말 이 가이드를 삭제하시겠습니까?
        </div>
        <div className="card-body p-4">
          <div className="alert alert-warning mb-4 small" role="alert">
            <strong>주의:</strong> 삭제된 가이드 본문과 업로드된 현장 사진 파일은 복구할 수 없습니다.
          </div>

          <table className="table table-bordered mb-4">
            <tbody>
              <tr>
                <th className="table-light" style={{ width: '30%' }}>가이드 제목</th>
                <td className="fw-bold">{data.title || '-'}</td>
              </tr>
              <tr>
                <th className="table-light">등록일</th>
                <td>{data.rdate ? data.rdate.substring(0, 16).replace('T', ' ') : '-'}</td>
              </tr>
              {data.file1 && (
                <tr>
                  <th className="table-light">첨부 사진</th>
                  <td className="text-muted small">{data.file1} (삭제 시 서버에서 영구 제거됨)</td>
                </tr>
              )}
            </tbody>
          </table>

          <form onSubmit={handleDelete}>
            <div className="mb-4">
              <label className="form-label fw-bold">비밀번호 확인 <span className="text-danger">*</span></label>
              <input
                type="password"
                className="form-control"
                placeholder="등록 시 설정한 패스워드"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
              <Link to={`/contents/read/${contentsno}`} className="btn btn-outline-secondary px-4">
                취소
              </Link>
              <button
                type="submit"
                className="btn btn-danger px-4 fw-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? '삭제 중...' : '영구 삭제'}
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