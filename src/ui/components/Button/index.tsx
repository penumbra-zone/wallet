import React, { ReactElement, useMemo } from 'react';

type ButtonProps = {
  title: string | ReactElement;
  disabled?: boolean;
  mode: 'gradient' | 'icon_transparent' | 'transparent';
  className?: string;
  iconLeft?: JSX.Element;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({
  mode,
  title,
  disabled,
  className,
  iconLeft,
  onClick,
}) => {
  const cn = useMemo(() => {
    if (mode === 'gradient' && !disabled)
      return `w-[100%] button_gradient text-white text_button ext:py-[7px] tablet:py-[14px] rounded-[15px] ${className}`;

    if (mode === 'gradient' && disabled)
      return `w-[100%] button_gradient_disabled text-white-0.3 text_button ext:py-[7px] tablet:py-[14px] rounded-[15px] ${className}`;

    if (mode === 'transparent' && !disabled)
      return `w-[100%] bg-brown  text-white text_button border-[1px] border-solid border-dark_grey ext:py-[7px] tablet:py-[14px] rounded-[15px]
      hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.15)]  hover:to-[rgba(255,144,47,0.15]
      ${className}`;

    if (mode === 'transparent' && disabled)
      return `w-[100%] bg-brown  text-light_brown text_button border-[1px] border-solid border-dark_greyext:py-[7px] tablet:py-[14px] rounded-[15px]
      ${className}`;
  }, [className, mode, disabled]);

  if (mode === 'icon_transparent')
    return (
      <button
        disabled={disabled}
        onClick={onClick}
        className="flex text_button items-center text-light_grey"
      >
        <span>{iconLeft}</span>
        <span>{title}</span>
      </button>
    );

  return (
    <button disabled={disabled} onClick={onClick} className={`${cn}`}>
      {title}
    </button>
  );
};
