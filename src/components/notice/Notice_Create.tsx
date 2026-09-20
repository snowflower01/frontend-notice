import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { GlobalStoreSession } from '../../store/store.js';

const Notice_Create = () => {
  const navigate = useNavigate();
  const { id } = GlobalStoreSession();

  const [form, setForm] = useState({
    title: '',
    content: '',
    processtype: '입고(IB)',
    writer: id || '관리자'
  });
  const [file1, setFile1] = useState<File | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile1(e.target.files[0]);
    } else {
      setFile1(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('제목을 입력해주세요.');
    if (!form.content.trim()) return alert('내용을 입력해주세요.');

    try {
      // 파일 전송을 위한 FormData 구성
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      formData.append('processtype', form.processtype);
      formData.append('writer', form.writer);
      if (file1) {
        formData.append('file1MF', file1);
      }

      // multipart 전송
      await axiosInstance.post('/notice/save_file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('공지사항이 등록되었습니다.');
      navigate('/notice/list');
    } catch (err) {
      console.error('공지 등록 실패:', err);
      alert('공지 등록 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={{ width: '65%', margin: '30px auto', textAlign: 'left' }}>
      <div className="title_line" style={{ fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        ✍ 공지사항 등록 (파일 첨부 지원)
      </div>

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label fw-bold">운영공정</label>
          <select name="processtype" className="form-select" value={form.processtype} onChange={onChange}>
            <option value="입고(IB)">입고(IB)</option>
            <option value="출고(OB)">출고(OB)</option>
            <option value="재고(ICQA)">재고(ICQA)</option>
            <option value="허브(HUB)">허브(HUB)</option>
            <option value="공통">공통</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">제목</label>
          <input type="text" name="title" className="form-control" placeholder="공지사항 제목" value={form.title} onChange={onChange} required />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">작성자</label>
          <input type="text" name="writer" className="form-control" value={form.writer} onChange={onChange} />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">내용</label>
          <textarea name="content" rows={7} className="form-control" placeholder="공지 내용 입력" value={form.content} onChange={onChange} required />
        </div>

        {/* 파일 업로드 인풋 (평가 8번 항목) */}
        <div className="mb-3">
          <label className="form-label fw-bold">첨부 파일</label>
          <input type="file" className="form-control" onChange={onFileChange} />
          <div className="form-text">이미지 파일(jpg, png) 또는 문서 파일 첨부 가능</div>
        </div>

        <div className="text-center mt-4">
          <button type="submit" className="btn btn-primary me-2">등록</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default Notice_Create;