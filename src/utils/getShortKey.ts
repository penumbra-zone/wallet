export const getShortKey = (text: string) => {
  if (!text) return '';
  return text.slice(0, 36) + '...';
};

export const getShortName = (text: string) => {
  if(!text) return;
  if(text.length <= 14) return text;
  return text.slice(0,14) + '...'
}
