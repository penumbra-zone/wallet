type PopupButtonProps = {
  svg: JSX.Element;
  text: string;
  onClick?: () => void;
};
export const PopupButton: React.FC<PopupButtonProps> = ({
  svg,
  text,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center py-[12px] px-[18px] cursor-pointer"
      role="button"
      tabIndex={0}
    >
      {svg}
      <p className="pl-[16px] text_ext">{text}</p>
    </div>
  );
};
