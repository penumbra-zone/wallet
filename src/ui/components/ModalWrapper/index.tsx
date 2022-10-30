import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

type ModalWrapperPropsType = {
  show: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactElement;
};

export const ModalWrapper: React.FC<ModalWrapperPropsType> = ({
  show,
  onClose,
  children,
  className,
}) => {
  const [_document, setDocument] = useState<Document | null>(null);

  useEffect(() => {
    setDocument(document);
  }, []);

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) =>
    e.stopPropagation();

  const modalContent = show ? (
    <div
      className="top-[0] w-[100%] h-[100vh] fixed bg-background-0.7 overflow-y-hidden z-150 "
      onClick={onClose}
    >
      <div className={`w-[100%] h-[90vh] flex items-center justify-center `}>
        <div
          className={`bg-brown ${className} rounded-[15px]  p-[30px]`}
          onClick={stopPropagation}
        >
          {/* <div className="relative">
            <div
              className="cursor-pointer absolute right-[-2px] top-[-8px]"
              onClick={onClose}
              role="button"
              tabIndex={0}
            >
              sadas
            </div>
          </div> */}
          {children}
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
