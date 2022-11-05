import { Fragment } from 'react';
import { useAccountsSelector } from '../../../../accounts';
import {
  selectLastExistBlock,
  selectLastSavedBlock,
  selectNetworks,
} from '../../../redux';
import { Button } from '../../Button';
import { ModalWrapper } from '../../ModalWrapper';
import { percentage } from '../../NetworkSelect';
import { PopupButton } from '../../PopupButton';
import { ProgressBar } from '../../ProgressBar';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

export const NetworkModal: React.FC<SuccessCreateModalProps> = ({
  show,
  onClose,
}) => {
  const networks = useAccountsSelector(selectNetworks);
  const lastExistBlock = useAccountsSelector(selectLastExistBlock);
  const lastSavedBlock = useAccountsSelector(selectLastSavedBlock);

  const percent = percentage(lastSavedBlock, lastExistBlock);

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
          {networks.map((i) => (
            <Fragment key={i.name}>
              <PopupButton
                svg={
                  <div className="w-[20px] h-[20px]">
                    <ProgressBar percent={percent} />
                  </div>
                }
                rightChild={
                  <p className="text-light_grey text-[10px] pl-[8px]">
                    {lastSavedBlock}/{lastExistBlock}
                  </p>
                }
                text={i.chainId}
              />
            </Fragment>
          ))}

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
