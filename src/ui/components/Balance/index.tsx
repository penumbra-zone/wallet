import { useEffect, useState } from 'react';
import { useAccountsSelector } from '../../../accounts';
import { IndexedDb } from '../../../utils';
import { selectLastExistBlock, selectLastSavedBlock } from '../../redux';
import Background from '../../services/Background';

type BalanceProps = {
  className?: string;
};

export const Balance: React.FC<BalanceProps> = ({ className }) => {
  const [balance, setBalance] = useState<number>(0);
  const lastSavedBlock = useAccountsSelector(selectLastSavedBlock);
  const lastExistBlock = useAccountsSelector(selectLastExistBlock);

  const getNotes = async () => {
    const data = await Background.getAllValueIndexedDB('notes');
    if (!data.length) return setBalance(0);

    const max = data.reduce(function (prev, current) {
      return prev.height > current.height ? prev : current;
    });

    setBalance(max.amount);
  };

  useEffect(() => {
    if (lastSavedBlock.testnet !== lastExistBlock.testnet) return;

    getNotes();
  }, [lastExistBlock, lastSavedBlock]);
  return <p className={className}>{balance} PNB</p>;
};
