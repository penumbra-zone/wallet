export type PasswordValidatorsType = {
  isDigit: boolean;
  isSymbol: boolean;
  isUpper: boolean;
  isLower: boolean;
  isEightLength: boolean;
};

export const validatePassword = (value: string) => {
  if (!value) return {};
  let validators = {
    isDigit: false,
    isSymbol: false,
    isUpper: false,
    isLower: false,
    isEightLength: false,
  };

  const symbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  validators = symbols.test(value)
    ? { ...validators, isSymbol: true }
    : { ...validators, isSymbol: false };

  const digits = /[0123456789]+/;
  validators = digits.test(value)
    ? { ...validators, isDigit: true }
    : { ...validators, isDigit: false };

  validators = value.match('[A-Z]')
    ? { ...validators, isUpper: true }
    : { ...validators, isUpper: false };

  validators = value.match('[a-z]')
    ? { ...validators, isLower: true }
    : { ...validators, isLower: false };

  validators =
    value.length >= 8
      ? { ...validators, isEightLength: true }
      : { ...validators, isEightLength: false };
      
  return validators;
};
