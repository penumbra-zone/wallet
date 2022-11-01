import { Button } from '../../Button';
import { ModalWrapper } from '../../ModalWrapper';
import { PopupButton } from '../../PopupButton';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

export const NetworkModal: React.FC<SuccessCreateModalProps> = ({
  show,
  onClose,
}) => {
  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="top_right"
      className="py-[20px] px-[0px] w-[296px] mr-[106px]"
    >
      <div className="flex flex-col">
        <p className="h1_ext px-[18px] pb-[24px] border-b-[1px] border-solid border-dark_grey text-center">
          Networks
        </p>
        <div className="pt-[24px]">
          <PopupButton
            svg={
              <div className="w-[8px] h-[8px] bg-[#608E84] rounded-[50%] mr-[8px]"></div>
            }
            text="Penumbra Mainnet"
          />
          <div className="w-[100%] mt-[40px] px-[16px]">
            <Button
              title="Change"
              mode="gradient"
              onClick={() => console.log('asd')}
              className="py-[7px]"
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
