import { useState } from 'react';
import { Address } from './Address';
import { DetailTxBeforeSend } from './DetailTxBeforeSend';

export const Send = () => {
  const [search, setSearch] = useState<string>(
    'penumbrav2t156t9s3s0786ghjnpk20jjaweqyeavfevpd7rkjycllu5qtevuuy69j948fy6gpgwptl2mgcgl0u5mw8glk38puggxx290cryz6pvxde3vgv4tuuey4rlrpf2smes5wt2m957r9'
  );
  const [amount, setAmount] = useState<string>('0.1');
  const [select, setSelect] = useState<string>('PNB');
  const [isOpenDetailTx, setIsOpenDetailTx] = useState<boolean>(true);

  return (
    <div className="w-[100%] flex items-center justify-center">
      <div className="w-[400px] ext:py-[40px] tablet:py-[0px] ext:px-[40px] tablet:px-[0px] tablet:mb-[20px]">
        {isOpenDetailTx ? (
          <DetailTxBeforeSend
            setIsOpenDetailTx={setIsOpenDetailTx}
            recipient={search}
            currency={select}
            amount={amount}
          />
        ) : (
          <Address
            search={search}
            select={select}
            amount={amount}
            setAmount={setAmount}
            setSearch={setSearch}
            setSelect={setSelect}
            setIsOpenDetailTx={setIsOpenDetailTx}
          />
        )}
      </div>
    </div>
  );
};
