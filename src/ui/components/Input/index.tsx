import { useRef, useState } from 'react';
import { CloseEyeSvg, OpenEyeSvg } from '../Svg';

export interface InputProps extends React.InputHTMLAttributes<HTMLElement> {
  label: string;
  isError?: boolean;
  helperText?: string;
  customType?: 'password' | 'text';
}

export const Input: React.FC<InputProps> = ({
  isError = false,
  helperText,
  label,
  placeholder,
  customType = 'text',
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocus, setFocus] = useState(false);
  const [isOpenPass, setIsOpenPass] = useState(false);

  const containerHandler = () => {
    inputRef.current?.focus();
    setFocus(true);
  };

  const inputBlurHandler = () => setFocus(false);

  const toggleEye = (event) => {
    event.stopPropagation();
    setIsOpenPass((state) => !state);
  };

  return (
    <div>
      <label htmlFor="" className="h2">
        {label}
      </label>
      <div
        className={`w-[100%] h-[52px] rounded-[15px] flex items-center justify-center mt-[8px] 
        ${
          isError
            ? 'bg-red'
            : isFocus || props.value
            ? 'bg-gradient-to-r from-[rgba(139,228,217,0.6)] via-[rgba(200,184,128,0.6)] to-[rgba(255,144,47,0.5)]'
            : 'input_default_border hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.6)] hover:via-[rgba(200,184,128,0.6)] hover:to-[rgba(255,144,47,0.5)]'
        } 
        `}
        onClick={containerHandler}
      >
        <div
          className={`w-[calc(100%-2px)] rounded-[15px] ${
            props.value && !isError ? 'bg-brown' : 'bg-background'
          }`}
        >
          <div
            className={`w-[100%] h-[50px] ${
              props.value && !isError ? 'input_typing_bg' : 'bg-brown'
            } cursor-text rounded-[15px] flex justify-center items-center`}
          >
            <input
              ref={inputRef}
              className={`${
                customType === 'password'
                  ? 'w-[calc(100%-80px)]'
                  : 'w-[calc(100%-40px)]'
              } h-[50px] rounded-[15px] border-[none] px-[5px] bg-transparent text_body
              active:outline-none focus:outline-none placeholder:text-[#524B4B] placeholder:text_body`}
              onBlur={inputBlurHandler}
              placeholder={placeholder}
              type={
                customType === 'password'
                  ? isOpenPass
                    ? 'text'
                    : 'password'
                  : 'text'
              }
              {...props}
            />
            {customType === 'password' && (
              <div
                className="ml-[18px] mr-[12px] cursor-pointer"
                onClick={toggleEye}
              >
                {isOpenPass ? <OpenEyeSvg /> : <CloseEyeSvg />}
              </div>
            )}
          </div>
        </div>
      </div>
      {helperText && (
        <div className="pt-[8px] h-[30px] ">
          {isError && (
            <p className="w-[100%]  text-red text_body">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};
