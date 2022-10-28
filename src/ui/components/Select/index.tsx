import { Ref, useCallback, useEffect, useRef, useState } from 'react';
import SelectComponent, { MultiValue, SingleValue } from 'react-select';

export type OptionType = {
  value: string;
  label: string;
};

type SelectPropsType = {
  fieldName: string;
  label?: string;
  isLoading?: boolean;
  placeholder?: string;
  options: OptionType[];
  initialValue?: string[] | string;
};

export const Select: React.FC<SelectPropsType> = ({
  label,
  options,
  isLoading,
  placeholder,
  initialValue,
  fieldName = '1',
}) => {
  const [values, setValues] = useState<string[] | string | null>(null);
  const [isFocus, setFocus] = useState(false);
  const inputRef = useRef<any>(null);
  //add initailValue
  useEffect(() => {
    if (!initialValue) return;
    setValues(initialValue);
  }, [initialValue]);

  //find selected value
  const selectedValue = useCallback(() => {
    if (values) return options.find((i) => i.value === values);
    else return '';
  }, [values, options])();

  const changeHandler = (
    newValue: MultiValue<string | OptionType> | SingleValue<string | OptionType>
  ) => setValues((newValue as OptionType).value);

  const containerHandler = () => {
    inputRef.current?.focus();
    setFocus(true);
  };

  const inputBlurHandler = () => setFocus(false);

  return (
    <div>
      <p className="h2">{label}</p>
      <div
        onClick={containerHandler}
        className={`w-[100%] h-[52px] rounded-[15px] flex items-center justify-center mt-[8px] rounded-[15px]
        ${
          isFocus || values
            ? 'bg-gradient-to-r from-[rgba(139,228,217,0.6)] via-[rgba(200,184,128,0.6)] to-[rgba(255,144,47,0.5)]'
            : 'input_default_border hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.6)] hover:via-[rgba(200,184,128,0.6)] hover:to-[rgba(255,144,47,0.5)]'
        }`}
      >
        <div
          className={`w-[calc(100%-2px)] h-[50px] rounded-[15px] bg-brown ${
            values ? 'input_typing_bg' : 'bg-brown'
          }`}
        >
          <SelectComponent
            ref={inputRef}
            classNamePrefix="custom_select"
            onChange={changeHandler}
            hideSelectedOptions={false}
            value={selectedValue}
            options={options}
            id={`long-value-select ${fieldName}`}
            instanceId={`long-value-select ${fieldName}`}
            isLoading={isLoading}
            placeholder="  "
            onBlur={inputBlurHandler}
          />
        </div>
      </div>
    </div>
  );
};
