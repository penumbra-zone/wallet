import React, { useState } from 'react';
import { InputProps } from '../Input';
import { CheckSvg } from '../Svg';

export const CheckBox: React.FC<InputProps> = ({ label }) => {
  const [isChecked, setCheked] = useState<boolean>(false);

  const checkHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setCheked(e.target.checked);

  return (
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="checkbox"
        checked={isChecked}
        onChange={checkHandler}
      />
      <div className="w-[30px] h-[30px] rounded-[5px] bg-gradient-to-r from-[rgba(139,228,217,0.6)] via-[rgba(200,184,128,0.6)] to-[rgba(255,144,47,0.5)] flex items-center justify-center">
        <span className="cursor-pointer bg-brown rounded-[5px] w-[29px] h-[29px] flex items-center justify-center">
          {isChecked ? <CheckSvg /> : ''}
        </span>
      </div>
      <span className="text_body text-light_grey ml-[8px]">{label}</span>
    </label>
  );
};
