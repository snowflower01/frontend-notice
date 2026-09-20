import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../Tool';
import { GlobalStoreSession } from '../../store/store.js';

interface NoticeItem {
  noticeno: number;
  title: string;
  content: string;
  processtype: string;
  writer: string;
  rdate: string;
}

const Notice_List = () => {
  const navigate = useNavigate();
  const { id } = GlobalStoreSession();

  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // 페이징 & 검색 상태 관리
  const [searchWord, setSearchWord] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const pageSize = 2; // 페이지당 10개씩 표시

  // 백엔드 페이징 API 호출
  const fetchNotices = async (page: number, word: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/notice/list_by_page', {
        params: {
          page: page,
          size: pageSize,
          title: word.trim()
        }
      });

      // Spring Data Page 객체 응답 처리
      if (res.data && res.data.content) {
        setNotices(res.data.content);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setNotices([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("공지사항 데이터 로드 실패:", err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  // 페이지 번호 변경 시 데이터 재호출
  useEffect(() => {
    fetchNotices(currentPage, searchWord);
  }, [currentPage]);

  // 검색 폼 제출 시 1페이지부터 검색
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotices(1, searchWord);
  };

  // 날짜 가공
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').substring(0, 16);
  };

  return (
    <div style={{ width: '80%', margin: '20px auto', textAlign: 'left' }}>
      <div className="title_line" style={{ fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        📢 공지사항
      </div>

      {/* 상단: 검색 바 & 등록 버튼 */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <form onSubmit={handleSearch} className="d-flex" style={{ width: '380px' }}>
          <input
            type="text"
            className="form-control form-control-sm me-2"
            placeholder="공지 제목 검색..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
          />
          <button type="submit" className="btn btn-outline-dark btn-sm text-nowrap">검색</button>
          {searchWord && (
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm ms-1 text-nowrap"
              onClick={() => { setSearchWord(''); setCurrentPage(1); fetchNotices(1, ''); }}
            >
              초기화
            </button>
          )}
        </form>

        <div className="d-flex align-items-center gap-3">
          <span className="text-muted small">전체 <strong>{totalElements}</strong>건</span>
          <button 
            type="button" 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/notice/create')}
          >
            공지 등록
          </button>
        </div>
      </div>

      {/* 공지 목록 테이블 */}
      {loading ? (
        <div className="text-center my-5">공지사항 데이터를 불러오는 중입니다...</div>
      ) : notices.length === 0 ? (
        <div className="text-center my-5 text-muted" style={{ border: '1px solid #dee2e6', padding: '30px 0', borderRadius: '4px' }}>
          등록된 사내 공지사항이 없습니다.
        </div>
      ) : (
        <table className="table table-hover" style={{ verticalAlign: 'middle', fontSize: '14px' }}>
          <thead className="table-light">
            <tr>
              <th style={{ width: '8%' }} className="text-center">번호</th>
              <th style={{ width: '15%' }} className="text-center">운영공정</th>
              <th style={{ width: '47%' }}>제목</th>
              <th style={{ width: '12%' }} className="text-center">작성자</th>
              <th style={{ width: '18%' }} className="text-center">등록일시</th>
            </tr>
          </thead>
          <tbody>
            {notices.map((item) => (
              <tr 
                key={item.noticeno} 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/notice/detail/${item.noticeno}`)}
              >
                <td className="text-center text-muted">{item.noticeno}</td>
                <td className="text-center">
                  <span className="badge bg-secondary" style={{ fontSize: '11px', padding: '5px 8px' }}>
                    {item.processtype || '전체'}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{item.title}</td>
                <td className="text-center">{item.writer || '관리자'}</td>
                <td className="text-center text-muted">{formatDate(item.rdate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 하단 페이지네이션 컨트롤 (평가 9번 항목) */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination pagination-sm">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>
                이전
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                  {pageNum}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>
                다음
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Notice_List;