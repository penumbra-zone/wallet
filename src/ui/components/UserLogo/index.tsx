import { useAccountsSelector } from '../../../accounts';
import { selectSelectedAccount } from '../../redux';

type UserLogoProps = {
  onClick?: () => void;
  className?: string;
};

export const UserLogo: React.FC<UserLogoProps> = ({ className, onClick }) => {
   const selectedAccount = useAccountsSelector(selectSelectedAccount);
  return (
    <div
      onClick={onClick}
      className={`h2 ext:w-[36px] ext:h-[36px] tablet:w-[52px] tablet:h-[52px] bg-brown rounded-[50%] border-[1px] border-solid border-dark_grey flex items-center justify-center  ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >{selectedAccount.name[0]}</div>
  );
};
