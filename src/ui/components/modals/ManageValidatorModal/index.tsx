import { AllValidatorsTableDataType } from '../../../containers';
import { Button } from '../../Button';
import { ModalWrapper } from '../../ModalWrapper';
import { WebsiteSvg } from '../../Svg';
import { SuccessCreateModalProps } from '../SuccessCreateModal';

type DataProps<T> = {
  data: AllValidatorsTableDataType;
};

export const ManageValidatorModal = <T, K extends keyof T>({
  show,
  onClose,
  data,
}: DataProps<T> & SuccessCreateModalProps): JSX.Element => {
  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      position="center"
      className="py-[32px] px-[20px] w-[608px]"
    >
      <div className="flex flex-col">
        <div className="flex items-center mb-[16px]">
          <p className="h1_ext mr-[10px]">{data.name}</p>
          {data.website && (
            <a
              href={data.website}
              target="_blank"
              className="flex items-center cursor-pointer svg_hover text-light_grey hover:text-white"
            >
              <WebsiteSvg />
              <p className="ml-[4px] link_website">Website</p>
            </a>
          )}
        </div>
        <div className="flex items-center h2_ext text-light_grey">
          <p className="mr-[12px]">Commission {data.commission}%</p>
          <p className="pl-[12px] border-l-[2px] border-solid border-light_brown">
            APR {data.arp}%
          </p>
        </div>
        <p className="h2_ext text-light_grey mb-[28px] mt-[26px]">
          {data.description}
        </p>
        <div className="w-[100%] flex flex-col bg-dark_grey rounded-[15px] py-[24px] px-[20px]">
          <p className="h2_ext text-light_grey">Your Delegation</p>
          <p className="mt-[14px] mb-[16px] text_numbers_ext text-white">
            0 PNB
          </p>
          <p className="text_numbers_ext text-light_grey">$ -</p>
        </div>
        <div className="w-[100%] flex justify-end mt-[24px]">
          <Button
            mode="transparent"
            onClick={() => console.log('asd')}
            title="Redelegate"
            className="w-[120px] tablet:py-[9px]"
          />
          <Button
            mode="gradient"
            onClick={() => console.log('asd')}
            title="Delegate"
            className="w-[120px] ml-[16px] tablet:py-[9px]"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};
