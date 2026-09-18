import React, { useState, useEffect } from 'react';
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
  const { login } = GlobalStoreSession();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 백엔드 고유 매핑 주소인 /notice/find_all 호출
  useEffect(() => {
    axiosInstance.get('/notice/find_all')
      .then(res => {
        // 백엔드 리스트 응답 바인딩
        setNotices(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("공지사항 목록 로드 실패:", err);
        setLoading(false);
      });
  }, []);

  // 날짜 포맷팅 디테일 정렬
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return dateStr.replace('T', ' ').substring(0, 16);
  };

  return (
    <div style={{ width: '80%', margin: '20px auto', textAlign: 'left' }}>
      <div className="title_line" style={{ fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        📢  공지사항 
      </div>

      {loading ? (
        <div className="text-center my-5">공지사항 데이터를 불러오는 중입니다...</div>
      ) : notices.length === 0 ? (
        <div className="text-center my-5 text-muted" style={{ border: '1px solid #dee2e6', padding: '4px 0', borderRadius: '4px' }}>
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
              <tr key={item.noticeno} style={{ cursor: 'pointer' }}>
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
    </div>
  );
};

export default Notice_List;