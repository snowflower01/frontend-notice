import React, { useEffect, useState, type FormEvent } from 'react';
import { axiosInstance } from '../Tool';
import { GlobalStoreSession } from '../../store/store';
import type ReplyType from './ReplyType';

interface ReplyListProps {
  contentsno: number;
}

export default function ReplyList({ contentsno }: ReplyListProps) {
  // 세션 스토어에서 로그인 사용자 정보 참조 (없으면 기본값)
  const { memberno, id } = GlobalStoreSession();

  const [list, setList] = useState<ReplyType[]>([]);
  const [content, setContent] = useState<string>('');
  const [passwd, setPasswd] = useState<string>('1234');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 1. 댓글 목록 조회
  const fetchReplies = async () => {
    if (!contentsno) return;
    try {
      const res = await axiosInstance.get('/reply/list_by_contentsno', {
        params: { contentsno }
      });
      setList(res.data || []);
    } catch (err) {
      console.error('댓글 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchReplies();
  }, [contentsno]);

  // 2. 댓글 등록
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      alert('피드백 내용을 작성해 주세요.');
      return;
    }

    const payload = {
      contentsno,
      memberno: memberno || 1,
      id: id || '작업자',
      content: content.trim(),
      passwd: passwd.trim(),
    };

    try {
      setIsLoading(true);
      const res = await axiosInstance.post('/reply/create', payload);
      if (res.data === 1) {
        setContent('');
        fetchReplies(); // 목록 새로고침
      } else {
        alert('댓글 등록에 실패했습니다.');
      }
    } catch (err) {
      console.error('댓글 등록 에러:', err);
      alert('서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 댓글 삭제 (패스워드 검증)
  const handleDelete = async (replyno: number) => {
    const inputPasswd = prompt('댓글 작성 시 설정한 비밀번호를 입력하세요:');
    if (inputPasswd === null) return;
    if (!inputPasswd.trim()) {
      alert('비밀번호를 입력해야 삭제할 수 있습니다.');
      return;
    }

    try {
      const res = await axiosInstance.post('/reply/delete', {
        replyno,
        passwd: inputPasswd.trim()
      });

      if (res.data === 1) {
        alert('댓글이 삭제되었습니다.');
        fetchReplies();
      } else if (res.data === 2) {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        alert('삭제할 댓글을 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('댓글 삭제 에러:', err);
      alert('삭제 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="card shadow-sm border-0 mt-4 mb-5">
      <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="fw-bold mb-0 text-dark">
          💬 현장 피드백 & 질문 <span className="badge bg-primary ms-1">{list.length}</span>
        </h5>
      </div>

      <div className="card-body p-4">
        {/* 등록 폼 */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-2">
            <textarea
              className="form-control"
              rows={3}
              placeholder="작업 중 발생한 특이사항, 개선점, 문의사항을 남겨주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="small text-muted">비밀번호:</span>
              <input
                type="password"
                className="form-control form-control-sm"
                style={{ width: '130px' }}
                placeholder="비밀번호"
                value={passwd}
                onChange={(e) => setPasswd(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm px-4 fw-bold"
              disabled={isLoading}
            >
              {isLoading ? '등록 중...' : '피드백 등록'}
            </button>
          </div>
        </form>

        {/* 댓글 목록 */}
        <div className="border-top pt-3">
          {list.length === 0 ? (
            <div className="text-center text-muted py-4 small">
              등록된 피드백이 없습니다. 첫 의견을 남겨보세요.
            </div>
          ) : (
            list.map((item) => (
              <div key={item.replyno} className="border-bottom py-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div>
                    <span className="fw-bold text-dark me-2">{item.id || `작업자 ${item.memberno}`}</span>
                    <span className="text-muted small">
                      {item.rdate ? item.rdate.substring(0, 16).replace('T', ' ') : '-'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm py-0 px-2"
                    style={{ fontSize: '11px' }}
                    onClick={() => handleDelete(item.replyno)}
                  >
                    삭제
                  </button>
                </div>
                <div 
                  style={{ 
                    whiteSpace: 'pre-wrap', 
                    color: '#333', 
                    fontSize: '14.5px', 
                    lineHeight: '1.6' 
                  }}
                >
                  {item.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}