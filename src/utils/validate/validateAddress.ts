export type AddressValidatorsType = {
  hasRightStart: boolean;
  hasRightLength: boolean;
  uniqueName: boolean;
  uniqueAddress: boolean;
};

export const validateAddress = (value: string) => {
  if (!value) return {};
  let validators = {
    hasRightStart: false,
    hasRightLength: false,
  };

  validators =
    value.slice(0, 8) === 'penumbra'
      ? { ...validators, hasRightStart: true }
      : { ...validators, hasRightStart: false };

  validators =
    value.length === 146
      ? { ...validators, hasRightLength: true }
      : { ...validators, hasRightLength: false };

  return validators;
};
