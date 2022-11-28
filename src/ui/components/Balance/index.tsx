import { useEffect, useState } from 'react';
import { useAccountsSelector, useAppDispatch } from '../../../accounts';
import {
  accountsActions,
  selectLastExistBlock,
  selectLastSavedBlock,
} from '../../redux';
import Background from '../../services/Background';

type BalanceProps = {
  className?: string;
};

export const Balance: React.FC<BalanceProps> = ({ className }) => {
  const [balance, setBalance] = useState<number>(0);
  const lastSavedBlock = useAccountsSelector(selectLastSavedBlock);
  const lastExistBlock = useAccountsSelector(selectLastExistBlock);

  const dispatch = useAppDispatch();

  const getNotes = async () => {
    const data = await Background.getAllValueIndexedDB('notes');
    if (!data.length) return setBalance(0);

    const max = data.reduce(function (prev, current) {
      return prev.height > current.height ? prev : current;
    });
    console.log({max: max.amount});
    
    dispatch(accountsActions.setBalance(Number(max.amount)));
    setBalance(max.amount);
  };

  useEffect(() => {
    if (lastSavedBlock.testnet !== lastExistBlock.testnet) return;

    getNotes();
  }, [lastExistBlock, lastSavedBlock]);
  return <p className={className}>{balance.toLocaleString('en-US')} PNB</p>;
};
