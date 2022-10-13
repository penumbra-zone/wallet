import { extensionApi } from './extensionApi';

export const loadState = () => {
  try {
    const state = extensionApi.storage.local.get('store');
    return state || undefined;
  } catch (error) {
    console.log('loadState error:', error);
    return undefined;
  }
};


export const saveState = (store: any) => {
  extensionApi.storage.local.set({ store });
};
