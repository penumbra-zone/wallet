import React, { ReactElement, useMemo } from 'react';

type ButtonProps = {
  title: string | ReactElement;
  disabled?: boolean;
  mode: 'gradient';
  className?: string;
  onClick: () => void;
};

export const Button: React.FC<ButtonProps> = ({
  mode,
  title,
  disabled,
  className,
  onClick,
}) => {
  const cn = useMemo(() => {
    if (mode === 'gradient' && !disabled) {
      return `w-[100%] button_gradient text-white text_button py-[15px] rounded-[15px] 
       hover:shadow-button_shadow
       ${className}`;
    }
    if (mode === 'gradient' && disabled) {
      return `w-[100%] button_gradient_disabled text-white text_button py-[15px] rounded-[15px] 
       ${className}`;
    }

    //  hover:border-[2px] hover:border-solid hover:border-turquoise_hover
    //    disabled:bg-purple disabled:text-dark_purple disabled:border-purple
    // } else if (mode === 'big') {
    //   return `w-[100%] bg-turquoise text-purple demiH3 py-[10px]
    //   rounded-[8px] border-[2px] border-solid border-turquoise
    //   hover:border-[2px] hover:border-solid hover:border-turquoise_hover
    //   disabled:bg-purple disabled:text-dark_purple disabled:border-purple ${className}`;
    // } else if (mode === 'disconnect') {
    //   return `w-[100%] bg-transparent text-red bodyTextDemi py-[2px]
    //    rounded-[8px] border-[2px] border-solid border-red
    //    hover:bg-red_hover disabled:opacity-50 ${className}`;
    // } else if (mode === 'selection') {
    //   return `w-[100%] ${className}`;
    // } else if (mode === 'transparent') {
    //   return `w-[100%] bg-transparent text-turquoise demiH3 py-[10px]
    //   rounded-[8px] border-[2px] border-solid border-turquoise
    //   hover:bg-turquoise-0.15
    //  disabled:opacity-[0.5] disabled:bg-transparent ${className}`;
    // } else if (mode === 'connect') {
    //   return `w-[100%] purpleGradient demiH3 py-[10px]
    //   rounded-[8px] border-[2px] border-solid border-dark_purple
    //   hover:bg-gradient-to-r hover:from-[#6CE1F5] hover:via-[#EE7FDC] hover:to-[#FBE86B]
    //  disabled:bg-gradient-to-r disabled:from-middle_purple disabled:via-middle_purple] disabled:to-middle_purple disabled:text-light_purple disabled:border-light_purple ${className}`;
    // }
  }, [className, mode, disabled]);

  return (
    <button disabled={disabled} onClick={onClick} className={`${cn}  z-[2]`}>
      {title}
    </button>
  );
};
