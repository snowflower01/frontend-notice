import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { axiosInstance } from '../Tool';
import SimpleModal, {type SimpleModalTypePayload} from '../SimpleModal';

const Member_Delete = () => {
  const { memberno } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);

  // -------------------------------------------------------------------------------
  // SimpleModal (상태 관리 안정화)
  // -------------------------------------------------------------------------------
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
    onConfirm: payload.onConfirm ?? undefined  
  });

  // 💡 순수하게 모달창만 숨기도록 원상복구합니다.
  const closeModal = () => setModal((m) => ({ ...m, show: false })); 
  // -------------------------------------------------------------------------------

  // 삭제할 레코드 정보 읽기
  useEffect(() => {
    axiosInstance.get(`/member/read/${memberno}`)
      .then(result => result.data)
      .then(data => {
        console.log('-> Member_Delete data:', data);
        setData(data);
      })
      .catch(err => {
        console.error(err);
        // 정보를 못 읽어왔을 때는 [확인/닫기]를 누르면 목록으로 튕겨나가게 처리
        openModal({
          show: true, 
          title: '오류', 
          message: '직원 정보를 불러오지 못했습니다.\n잠시 후 다시 시도해주세요.',
          onConfirm: () => navigate('/member/find_all')
        });
      });
  }, [memberno]); // 💡 의존성 배열에 담아 안정성 확보

  // 삭제 처리
  const send = (e:React.SyntheticEvent) => {
    e.preventDefault(); 

    axiosInstance.delete(`/member/delete/${data.memberno}`)
    .then(result => result.data)
    .then(data => {
      // 0: 실패, 1: 성공
      if (data === 0) {
        openModal({
          show: true,
          title: '삭제 실패',
          message: '회원 정보 삭제에 실패 했습니다.\n다시 시도해주세요.'
          // 💡 실패 시에는 onConfirm을 주지 않거나 closeModal을 연동해 이 페이지에 머무르게 합니다.
        });
      } else if (data === 1) {
        openModal({
          show: true,
          title: '삭제 완료',
          message: '회원 정보를 삭제 했습니다.',
          onConfirm: () => {
            closeModal();
            navigate('/member/find_all'); // 성공 시 확실하게 목록 이동
          }
        });
      }
    })
    .catch(err => { 
      console.error(err); 
      openModal({
        show: true,
        title: '통신 오류',
        message: '서버 통신 중 에러가 발생했습니다.'
      });
    });
  };

  if (!data) { 
    return null; // 💡 빈 return 보다는 null 반환이 안전합니다.
  }

  return (
    <div>
      <div className='title_line'>관리자 삭제</div>
      <form onSubmit={send} style={{ margin: '10px auto', width: '70%', textAlign: 'left' }}>
        <div style={{textAlign: 'center', marginTop: '10px', marginBottom: '10px'}}>삭제할 관리자 정보</div> 
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">아이디</label>
          <div className='div_row_content'>{data.id}</div>
        </div>
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">성명</label>
          <div className='div_row_content'>{data.username}</div>
        </div>
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">등급</label>
          <div className='div_row_content'>{data.grade}</div>
        </div>      
        <div className="mb-3 div_row">
          <label className="form-label div_row_label">등록일</label>
          <div className='div_row_content'>{data.createdate}</div>
        </div>
        
        <div style={{textAlign: 'center', marginTop: '10px', marginBottom: '20px', color: 'red'}}>
          회원 정보를 삭제하면 복구 할 수 없습니다. 삭제하시겠습니까?
        </div> 
        
        <div style={{ textAlign: 'center' }}>
          <button id='btnSend' type="submit" className="btn btn-primary btn-sm" style={{ marginRight: '10px' }}>
            삭제 진행
          </button>
          <button id='btnTest' type="button" className="btn btn-primary btn-sm" 
                  onClick={() => navigate('/member/find_all')}>
            취소
          </button>
        </div>
      </form>

      {/* 모달 */}
      <SimpleModal
        show={modal.show!}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
      />
    </div>
  );
};

export default Member_Delete;