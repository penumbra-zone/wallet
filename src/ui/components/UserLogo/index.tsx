type UserLogoProps = {
  onClick?: () => void;
  className?: string;
};

export const UserLogo: React.FC<UserLogoProps> = ({ className, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-[52px] h-[52px] bg-brown rounded-[50%] border-[1px] border-solid border-dark_grey flex items-center justify-center  ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    ></div>
  );
};
