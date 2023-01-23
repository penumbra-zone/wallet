import { Button } from '../Button';

type ActionBoxProps = {
  header: string;
  descriptions: string;
  buttonTitle: string;
  onClick: () => void;
  icon: JSX.Element;
  className?: string;
};

export const ActionBox: React.FC<ActionBoxProps> = ({
  className,
  header,
  descriptions,
  buttonTitle,
  icon,
  onClick,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-between py-[33px] px-[21px] bg-brown rounded-[15px] shadow-action_box  ${className}`}
    >
      <div className="flex flex-col items-center">
        {icon}
        <div className="mb-[24px] mt-[18px]">
          <p className="h2 mb-[6px] text-center">{header}</p>
          <p className="text_body text-light_grey text-center">
            {descriptions}
          </p>
        </div>
      </div>
      <div className="ext:w-[100%] laptop:w-[296px]">
        <Button title={buttonTitle} mode="gradient" onClick={onClick} />
      </div>
    </div>
  );
};
