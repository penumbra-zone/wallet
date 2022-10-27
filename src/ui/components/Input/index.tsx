import { useRef, useState } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLElement> {
  label: string;
  isError?: boolean;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  isError = false,
  helperText,
  label,
  placeholder,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>('');
  const [isFocus, setFocus] = useState(false);

  const containerHandler = () => {
    inputRef.current?.focus();
    setFocus(true);
  };

  const inputBlurHandler = () => setFocus(false);
  const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValue(e.target.value);

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
            : isFocus || value
            ? 'bg-gradient-to-r from-[rgba(139,228,217,0.6)] via-[rgba(200,184,128,0.6)] to-[rgba(255,144,47,0.5)]'
            : 'input_default_border hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.6)] hover:via-[rgba(200,184,128,0.6)] hover:to-[rgba(255,144,47,0.5)]'
        } 
        `}
        onClick={containerHandler}
      >
        <div
          className={`w-[calc(100%-2px)] rounded-[15px] ${
            value && !isError ? 'bg-brown' : 'bg-background'
          }`}
        >
          <div
            className={`w-[100%] h-[50px] ${
              value && !isError ? 'input_typing_bg' : 'bg-brown'
            } cursor-text rounded-[15px] flex justify-center items-center`}
          >
            <input
              ref={inputRef}
              className="w-[calc(100%-40px)] h-[50px] rounded-[15px] border-[none] px-[5px] bg-transparent text_body
              active:outline-none focus:outline-none placeholder:text-[#524B4B] placeholder:text_body"
              onBlur={inputBlurHandler}
              onChange={changeHandler}
              value={value}
              placeholder={placeholder}
              {...props}
            />
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
