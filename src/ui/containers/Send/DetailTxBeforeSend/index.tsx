import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountsSelector } from '../../../../accounts';
import { useMediaQuery } from '../../../../hooks';
import { getShortKey, getShortName, routesPath } from '../../../../utils';
import { Button, ChevronLeftIcon, UserLogo } from '../../../components';
import { selectContacts, selectNewAccount } from '../../../redux';
import Background from '../../../services/Background';

type DetailTxBeforeSendProps = {
  recipient: string;
  currency: string;
  amount: string;
  setIsOpenDetailTx: Dispatch<SetStateAction<boolean>>;
};

export const DetailTxBeforeSend: React.FC<DetailTxBeforeSendProps> = ({
  amount,
  recipient,
  currency,
  setIsOpenDetailTx,
}) => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery();
  const selectAccount = useAccountsSelector(selectNewAccount);
  const contacts = useAccountsSelector(selectContacts);

  const handleEdit = () => setIsOpenDetailTx(false);

  const handleBack = async () => {
    await Background.sendTransaction(recipient, Number(amount));
    navigate(routesPath.HOME);
  };
  
  return (
    <div className="w-[100%] flex flex-col items-start ext:py-[20px] tablet:py-[30px] bg-brown rounded-[15px]">
      <Button
        mode="icon_transparent"
        onClick={handleEdit}
        title="Edit"
        iconLeft={<ChevronLeftIcon stroke="#E0E0E0" />}
        className="ext:ml-[10px] tablet:ml-[16px] mb-[24px]"
      />
      <div className="w-[100%] flex items-center justify-start ext:px-[10px] tablet:px-[16px] mb-[24px]">
        <div className="flex items-center w-[48%]">
          {/* <div>
            <div className="ext:w-[30px] ext:h-[30px] tablet:w-[36px] tablet:h-[36px] rounded-[50%] border-[1px] border-solid border-dark_grey"></div>
          </div> */}
          <p className="h2 ext:ml-[8px] tablet:ml-[16px]">
            {selectAccount.name}
          </p>
        </div>
        <span className="rotate-180 w-[4%]">
          <ChevronLeftIcon
            width={isDesktop ? '24' : '16'}
            height={isDesktop ? '24' : '16'}
          />
        </span>
        <div className="flex items-center w-[48%]">
          {/* <div>
            <div className="ext:w-[30px] ext:h-[30px] tablet:w-[36px] tablet:h-[36px] rounded-[50%] border-[1px] border-solid border-dark_grey"></div>
          </div> */}
          <p className="h2 ext:ml-[8px] tablet:ml-[16px]">
            {contacts.find(i => i.address === recipient) ? contacts.find(i=> i.address ===recipient).name : getShortName(recipient)}
          </p>
        </div>
      </div>
      <div className="w-[100%] flex flex-col bg-dark_grey py-[16px] ext:px-[10px] tablet:px-[16px] ext:mb-[16px] tablet:mb-[24px]">
        <p className="text_button w-[158px] text-center py-[5px] rounded-[15px] border-[1px] border-solid border-light_brown ext:mb-[12px] tablet:mb-[8px]">
          Sending {currency.toUpperCase()}
        </p>
        <p className="text_numbers">{amount}</p>
      </div>
      <div className="w-[100%] flex flex-col ext:px-[10px] tablet:px-[16px] ext:mb-[24px] tablet:mb-[16px]">
        {/*<div className="flex justify-between items-center ext:mb-[16px] tablet:mb-[8px] mb-[16px]">*/}
        {/*  <p className="text_body">Estimated gas fee:</p>*/}
        {/*  <div>*/}
        {/*    <p className="text_numbers_s text-light_grey text-right">0</p>*/}
        {/*    <p className="text_numbers text-light_grey  text-right">*/}
        {/*      0 {currency}*/}
        {/*    </p>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*<div className="flex items-center justify-between">*/}
        {/*  <p className="text-body text-green">Probably in 30 seconds</p>*/}
        {/*  <p className="text-body text-light_grey">Max fee:</p>*/}
        {/*  <p className="text_numbers_s text-light_grey">0 {currency}</p>*/}
        {/*</div>*/}
      </div>
      <div className="w-[100%] flex flex-col ext:px-[10px] tablet:px-[16px] border-y-[1px] border-solid border-dark_grey ext:pt-[16px] ext:pb-[24px] tablet:pt-[24px] tablet:pb-[16px] mb-[40px]">
        <div className="flex justify-between items-center ext:mb-[16px] tablet:mb-[8px] mb-[16px]">
          <p className="text_body">Total:</p>
          <div>
            <p className="text_numbers_s text-light_grey text-right">
              {amount}
            </p>
            <p className="text_numbers text-light_grey  text-right">
              {amount} {currency}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-body">Amount + gas fee</p>
          <p className="text-body text-light_grey">Max amount:</p>
          <p className="text_numbers_s text-light_grey">
            {amount} {currency}
          </p>
        </div>
      </div>
      <div className="w-[100%] flex ext:px-[10px] tablet:px-[16px]">
        <Button
          mode="transparent"
          onClick={handleBack}
          title="Cancel"
          className="py-[7px] w-[50%] mr-[8px]"
        />
        <Button
          mode="gradient"
          onClick={handleBack}
          title="Confirm"
          className="py-[7px] w-[50%] ml-[8px]"
        />
      </div>
    </div>
  );
};
