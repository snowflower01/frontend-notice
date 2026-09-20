import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../Tool';

interface NoticeItem {
  noticeno: number;
  title: string;
  content: string;
  processtype: string;
  writer: string;
  rdate: string;
  file1?: string;
  file1saved?: string;
  size1?: number;
}

export default function Notice_Detail() {
  const { noticeno } = useParams<{ noticeno: string }>();
  const navigate = useNavigate();

  const [notice, setNotice] = useState<NoticeItem | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    processtype: ''
  });
  // 수정 시 신규 첨부할 파일 상태
  const [editFile, setEditFile] = useState<File | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await axiosInstance.get(`/notice/find_by_id?noticeno=${noticeno}`);
      setNotice(res.data);
      setEditForm({
        title: res.data.title,
        content: res.data.content,
        processtype: res.data.processtype || '공통'
      });
    } catch (err) {
      console.error('공지 상세 로드 실패:', err);
      alert('공지사항을 불러올 수 없습니다.');
    }
  };

  useEffect(() => {
    if (noticeno) {
      fetchDetail();
    }
  }, [noticeno]);

  // 수정 처리 (신규 파일이 있으면 교체, 없으면 기존 파일 유지)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('noticeno', String(noticeno));
      formData.append('title', editForm.title);
      formData.append('content', editForm.content);
      formData.append('processtype', editForm.processtype);

      if (editFile) {
        formData.append('file1MF', editFile);
      }

      await axiosInstance.post('/notice/update_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('공지사항이 수정되었습니다.');
      setIsEditing(false);
      setEditFile(null);
      fetchDetail();
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!window.confirm('정말 이 공지사항을 삭제하시겠습니까?')) return;
    try {
      await axiosInstance.delete(`/notice/${noticeno}`);
      alert('공지사항이 삭제되었습니다.');
      navigate('/notice/list');
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  if (!notice) return <div className="text-center my-5">데이터를 불러오는 중...</div>;

  return (
    <div style={{ width: '70%', margin: '30px auto', textAlign: 'left' }}>
      <div className="title_line" style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        📢 공지사항 {isEditing ? '수정' : '상세보기'}
      </div>

      {!isEditing ? (
        // 조회 화면
        <div className="card shadow-sm p-4">
          <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
            <h4 className="mb-0">{notice.title}</h4>
            <span className="badge bg-primary">{notice.processtype || '전체'}</span>
          </div>
          <div className="text-muted mb-4 small">
            작성자: <strong>{notice.writer || '관리자'}</strong> | 등록일: {notice.rdate?.replace('T', ' ').substring(0, 16)}
          </div>
          <div className="p-3 bg-light rounded" style={{ minHeight: '180px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {notice.content}
          </div>

          {/* 첨부 파일 표시 영역 (평가 8번 항목) */}
          {notice.file1saved && (
            <div className="mt-3 p-3 bg-white border rounded">
              <div className="fw-bold mb-2">📎 첨부 파일</div>
              {/\.(jpg|jpeg|png|gif)$/i.test(notice.file1saved) && (
                <div className="mb-2">
                  <img 
                    src={`http://localhost:9101/storage/notice/${notice.file1saved}`} 
                    alt={notice.file1} 
                    style={{ maxWidth: '350px', borderRadius: '4px', border: '1px solid #ddd' }} 
                  />
                </div>
              )}
              <div className="small text-muted">
                파일명: <strong>{notice.file1}</strong> ({Math.round((notice.size1 || 0) / 1024)} KB)
              </div>
            </div>
          )}

          <div className="text-center mt-4">
            <button className="btn btn-outline-secondary me-2" onClick={() => navigate('/notice/list')}>목록으로</button>
            <button className="btn btn-warning me-2" onClick={() => setIsEditing(true)}>수정</button>
            <button className="btn btn-danger" onClick={handleDelete}>삭제</button>
          </div>
        </div>
      ) : (
        // 수정 폼
        <form onSubmit={handleUpdate} className="card shadow-sm p-4">
          <div className="mb-3">
            <label className="form-label fw-bold">운영공정</label>
            <select 
              className="form-select"
              value={editForm.processtype} 
              onChange={(e) => setEditForm({ ...editForm, processtype: e.target.value })}
            >
              <option value="입고(IB)">입고(IB)</option>
              <option value="출고(OB)">출고(OB)</option>
              <option value="재고(ICQA)">재고(ICQA)</option>
              <option value="허브(HUB)">허브(HUB)</option>
              <option value="공통">공통</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">제목</label>
            <input 
              type="text" 
              className="form-control" 
              value={editForm.title} 
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">내용</label>
            <textarea 
              rows={8} 
              className="form-control" 
              value={editForm.content} 
              onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              required 
            />
          </div>

          {/* 수정 폼 내 파일 변경 인풋 */}
          <div className="mb-3">
            <label className="form-label fw-bold">첨부 파일 변경</label>
            {notice.file1 && (
              <div className="small text-muted mb-1">
                현재 등록된 파일: <strong>{notice.file1}</strong> (새 파일을 선택하면 기존 파일이 교체됩니다)
              </div>
            )}
            <input 
              type="file" 
              className="form-control" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setEditFile(e.target.files[0]);
                } else {
                  setEditFile(null);
                }
              }} 
            />
          </div>

          <div className="text-center mt-3">
            <button type="submit" className="btn btn-success me-2">수정 저장</button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => {
                setIsEditing(false);
                setEditFile(null);
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}