import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({ open, close, children }) => {
  if (!open) return null;

  // 모달 바깥 클릭 시 닫힘
  const handleBackgroundClick = (e) => {
    if (e.target.classList.contains('modal')) {
      close();
    }
  };

  return ReactDOM.createPortal(
    <div className="openModal modal" onClick={handleBackgroundClick}>
      <section onClick={(e) => e.stopPropagation()}>
        <main>{children}</main>
      </section>
    </div>,
    document.getElementById('modal-root') // 포탈 대상
  );
};

export default Modal;
