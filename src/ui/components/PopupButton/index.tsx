type PopupButtonProps = {
  svg: JSX.Element;
  text: string;
  rightChild?: JSX.Element
  onClick?: () => void;
};
export const PopupButton: React.FC<PopupButtonProps> = ({
  svg,
  text,
  rightChild,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-bettwen py-[12px] px-[18px]  cursor-pointer hover:bg-dark_grey"
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center">
        {svg}
        <p className="pl-[11px] text_ext">{text}</p>
      </div>
      {rightChild}
    </div>
  );
};
