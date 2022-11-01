export const getShortKey = (text: string) => {
  if (!text) return '';
  return text.slice(0, 5) + '..' + text.slice(-4);
};
