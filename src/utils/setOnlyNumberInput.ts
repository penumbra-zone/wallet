export const setOnlyNumberInput = (v: string) => {
  const positiveNumber =
    Number(v.replace(/\s/g, '').replace(/\,/g, '.')) < 0
      ? `${Number(v.replace(/\s/g, '').replace(/\,/g, '.')) * -1}`
      : Number(v.replace(/\s/g, '').replace(/\,/g, '.').replace(/^0+/, '0')) ===
          0 ||
        Number(v.replace(/\s/g, '').replace(/\,/g, '.').replace(/^0+/, '0')) < 1
      ? v.replace(/^0+/, '0')
      : v.replace(/^0+/, '');

  const value = positiveNumber.replace(/\s/g, '').replace(/\,/g, '.');

  const notShow = value.length > 4 && value.length === value.indexOf('.') + 5;

  const valueFloat = Number(value);

  return {
    value,
    notShow,
    valueFloat,
  };
};
