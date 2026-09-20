import React, { useEffect, useState, type ChangeEvent, type MouseEvent, type KeyboardEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { enter_chk, axiosInstance, getIP, isImage } from '../Tool';
import SimpleModal, { type SimpleModalTypePayload } from '../SimpleModal';
import type CateType from '../cate/CateType';
import type ContentsType from './ContentsType';
import none1_img from '../../assets/images/none1.png';

export default function Contents_Update_file1() {
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
  const [input, setInput] = useState<ContentsType>({
    contentsno: 0,
    title: '',
    file1: '',
    file1saved: '',
  });

  const [password, setPassword] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // 새 사진 실시간 미리보기

  useEffect(() => {
    if (!contentsno) return;

    axiosInstance.get(`/contents/read/${contentsno}`)
      .then(res => {
        const data = res.data;
        setInput({
          contentsno: data.contentsno,
          title: data.title || '',
          file1: data.file1 || '',
          file1saved: data.file1saved || '',
        });

        // 카테고리 정보 조회
        if (data.cateno) {
          axiosInstance.get(`/cate/${data.cateno}`)
            .then(cateRes => setCate(cateRes.data))
            .catch(err => console.error(err));
        }
      })
      .catch(err => console.error(err));
  }, [contentsno]);

  // 새 파일 선택 시 실시간 미리보기 생성
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

  // 3. 파일 변경 처리
  const send_update_file1 = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file) {
      openModal({
        show: true,
        title: '안내',
        message: '새로 교체할 사진 파일을 선택해 주세요.',
      });
      return;
    }

    if (!password.trim()) {
      openModal({
        show: true,
        title: '안내',
        message: '글 등록 시 입력했던 패스워드를 입력해 주세요.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', password.trim());
    formData.append('file1MF', file);

    try {
      const response = await axiosInstance.post(`/contents/update_file1`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = Number(response.data);

      if (result === 1) {
        openModal({
          show: true,
          title: '사진 변경 성공',
          message: '가이드 사진이 성공적으로 교체되었습니다.',
          onConfirm: () => navigate(`/contents/read/${input.contentsno}`),
        });
      } else if (result === 2) {
        openModal({
          show: true,
          title: '패스워드 불일치',
          message: '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.',
        });
      } else {
        openModal({
          show: true,
          title: '변경 실패',
          message: '사진 변경 처리에 실패했습니다. (결과 코드: ' + result + ')',
        });
      }
    } catch (err) {
      console.error(err);
      openModal({
        show: true,
        title: '네트워크 오류',
        message: '서버와 통신 중 문제가 발생했습니다.',
      });
    }
  };

  // 4. 파일 삭제 처리 (기본 상태로 리셋)
  const send_delete_file1 = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!password.trim()) {
      openModal({
        show: true,
        title: '안내',
        message: '패스워드를 입력해 주세요.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('contentsno', String(input.contentsno));
    formData.append('password', password.trim());

    try {
      const response = await axiosInstance.post(`/contents/delete_file1`, formData);
      const result = Number(response.data);

      if (result === 1) {
        openModal({
          show: true,
          title: '사진 삭제 완료',
          message: '등록된 사진이 삭제되었습니다.',
          onConfirm: () => navigate(`/contents/read/${input.contentsno}`),
        });
      } else if (result === 2) {
        openModal({
          show: true,
          title: '패스워드 불일치',
          message: '비밀번호가 일치하지 않습니다.',
        });
      } else if (result === 3) {
        openModal({
          show: true,
          title: '삭제 불가',
          message: '기본 이미지 상태이거나 삭제할 사진이 없습니다.',
        });
      }
    } catch (err) {
      console.error(err);
      openModal({
        show: true,
        title: '네트워크 오류',
        message: '서버와 통신 중 문제가 발생했습니다.',
      });
    }
  };

  // 현재 노출할 원본 이미지 경로 (포트 9101 기준)
  const currentImgSrc = input.file1saved && isImage(input.file1)
    ? `http://${getIP()}:9101/storage/contents/${input.file1saved}?t=${Date.now()}`
    : none1_img;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '40px auto', padding: '0 15px' }}>
      
      {/* 상단 네비게이션 헤더 */}
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div>
          <span className="badge bg-secondary mb-1">{cate.grp || '공정'}</span>
          <h3 className="fw-bold mb-0 text-dark">🖼️ 가이드 사진 변경</h3>
        </div>
        <div className="d-flex gap-2">
          <Link to={`/contents/read/${input.contentsno}`} className="btn btn-outline-secondary btn-sm">
            상세보기로
          </Link>
          <Link to={`/contents/list_all/${cate.cateno}`} className="btn btn-outline-secondary btn-sm">
            목록으로
          </Link>
        </div>
      </div>

      {/* 메인 수정 카드 */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 fw-bold fs-5">
          {input.title}
        </div>
        <div className="card-body p-4">
          <div className="row g-4 mb-4">
            
            {/* 좌측: 현재 등록된 사진 vs 새로 선택한 사진 미리보기 */}
            <div className="col-md-6 text-center">
              <label className="form-label fw-bold d-block text-secondary small">
                {previewUrl ? '✨ 새로 교체될 사진 (미리보기)' : '📌 현재 등록된 사진'}
              </label>
              <div 
                style={{ 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  backgroundColor: '#f8f9fa', 
                  border: '2px dashed #dee2e6',
                  height: '280px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <img
                  src={previewUrl || currentImgSrc}
                  alt="가이드 사진"
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = none1_img;
                  }}
                />
              </div>
              <div className="text-muted small mt-2">
                {previewUrl ? '선택된 새 파일 미리보기' : (input.file1 || '등록된 파일 없음')}
              </div>
            </div>

            {/* 우측: 파일 선택 및 비밀번호 입력 폼 */}
            <div className="col-md-6 d-flex flex-column justify-content-center">
              
              <div className="mb-3">
                <label className="form-label fw-bold">새 사진 파일 선택</label>
                <input
                  type="file"
                  name="file1MF"
                  id="file1MF"
                  className="form-control"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="form-text small">
                  JPG, PNG, GIF 등 이미지 파일만 업로드 가능합니다.
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">비밀번호</label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  placeholder="등록 시 설정한 비밀번호"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => enter_chk(e, 'btn_send_update')}
                  className="form-control"
                  required
                />
              </div>

              {/* 액션 버튼 바 */}
              <div className="d-flex gap-2">
                <button
                  type="button"
                  id="btn_send_update"
                  className="btn btn-primary fw-bold flex-fill py-2"
                  onClick={send_update_file1}
                >
                  🚀 사진 변경 저장
                </button>
                <button
                  type="button"
                  id="btn_send_delete"
                  className="btn btn-outline-danger fw-bold py-2"
                  onClick={send_delete_file1}
                >
                  🗑️ 사진 삭제
                </button>
              </div>

            </div>
          </div>
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