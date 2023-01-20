import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

type ModalWrapperPropsType = {
  show: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactElement;
  position?: 'center' | 'top_right';
};

export const ModalWrapper: React.FC<ModalWrapperPropsType> = ({
  show,
  onClose,
  children,
  className,
  position = 'center',
}) => {
  const [_document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    setDocument(document);
  }, []);

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) =>
    e.stopPropagation();

  const modalContent = show ? (
    <div
      className="top-[0] w-[100%] h-[100vh] fixed bg-background-0.7 overflow-y-hidden z-150"
      onClick={onClose}
    >
      <div className="flex items-center justify-center">
        <div
          className={`ext:h-[100vh] tablet:h-[100vh] flex ${
            position === 'center'
              ? 'items-center justify-center'
              : 'items-start justify-end mt-[100px]'
          }`}
        >
          <div
            className={`bg-brown rounded-[15px] p-[30px] ${className}`}
            onClick={stopPropagation}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (_document) {
    return ReactDOM.createPortal(
      modalContent,
      _document.getElementById('app-modal')!
    );
  } else {
    return null;
  }
};
