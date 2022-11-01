import { ChevronLeftIcon } from '../Svg';

type NetworkSelectProps = {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
};
export const NetworkSelect: React.FC<NetworkSelectProps> = ({
  isOpen,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`h-[52px] w-[296px] px-[20px] bg-brown rounded-[15px] border-[1px] border-solid border-dark_grey flex items-center justify-between cursor-pointer
      ${className}`}
    >
      <div className="flex items-center">
        <div className="w-[8px] h-[8px] bg-[#608E84] rounded-[50%] mr-[10px]"></div>
        <p className="text_button">Penumbra Mainnet</p>
      </div>
      <div className={`${!isOpen ? 'rotate-[270deg]' : 'rotate-[90deg]'}`}>
        <ChevronLeftIcon />
      </div>
    </div>
  );
};
