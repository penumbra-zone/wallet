import Background from '../../../services/Background';
import { Button } from '../../Button';
import { ModalWrapper } from '../../ModalWrapper';
import { CloseInElipseSvg } from '../../Svg';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

export const ResetWalletModal: React.FC<SuccessCreateModalProps> = ({
  show,
  onClose,
}) => {
  const handleConfirm = async () => {
    onClose();
    await Background.resetWallet();
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="center"
      className="w-[296px] pt-[28px] pb-[31px] px-[0px]"
    >
      <div className="w-[100%] flex flex-col items-center">
        <div className="w-[100%] flex flex-col items-center border-b-[1px] border-solid border-dark_grey">
          <CloseInElipseSvg width="44" height="44" stroke="#870606" />
          <p className="h1_ext mt-[16px] pb-[12px]">Are you sure?</p>
        </div>
        <div className="w-[100%] flex flex-col items-center px-[16px]">
          <p className="text-center text_ext pt-[16px]">
            Do you really want to reset your wallet? This process cannot be
            undone.
          </p>
          <div className="w-[100%] flex mt-[70px]">
            <Button
              mode="transparent"
              onClick={onClose}
              title="Cancel"
              className="py-[7px] w-[50%] mr-[8px]"
            />
            <Button
              mode="gradient"
              onClick={handleConfirm}
              title="Confirm"
              className="py-[7px] w-[50%] ml-[8px]"
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
