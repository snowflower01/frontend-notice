// /src/components/SimpleModal.tsx
interface SimpleModalType {
  show: boolean, 
  title: string, 
  message: string,
  onClose?: () => void,  // ?: 함수 선언 필수 아님.
  onConfirm?: () => void // ?: 함수 선언 필수 아님.
}

export interface SimpleModalTypePayload {
  show?: boolean, 
  title: string, 
  message: string,
  onConfirm?: () => void // ?: 함수 선언 필수 아님.
}

const SimpleModal = ({ show, title, message, onClose, onConfirm }:SimpleModalType) => {
  if (!show) return null;

  const handleConfirm = () => {
    onClose?.(); // onClose 함수 존재하면 실행함
    onConfirm?.();
  };

  // \n 줄바꿈 처리
  const renderMessage = (msg:string) =>
    String(msg).split('\n').map((line, i) => <span key={i}>{line}<br/></span>);

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '1rem' }}>
            <div className="modal-header">
              <h5 className="modal-title">{title || '알림'}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 0 }}>{renderMessage(message)}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>닫기</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleConfirm}>확인</button>
            </div>
          </div>
        </div>
      </div>
      {/* backdrop */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default SimpleModal